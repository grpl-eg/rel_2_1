package OpenILS::Application::Vandelay;
use strict; use warnings;
use OpenILS::Application;
use base qw/OpenILS::Application/;
use Unicode::Normalize;
use OpenSRF::EX qw/:try/;
use OpenSRF::AppSession;
use OpenSRF::Utils::SettingsClient;
use OpenSRF::Utils::Cache;
use OpenILS::Utils::Fieldmapper;
use OpenILS::Utils::CStoreEditor qw/:funcs/;
use MARC::Batch;
use MARC::Record;
use MARC::File::XML ( BinaryEncoding => 'UTF-8' );
use OpenILS::Utils::Fieldmapper;
use Time::HiRes qw(time);
use OpenSRF::Utils::Logger qw/$logger/;
use MIME::Base64;
use OpenILS::Const qw/:const/;
use OpenILS::Application::AppUtils;
use OpenILS::Application::Cat::BibCommon;
use OpenILS::Application::Cat::AuthCommon;
use OpenILS::Application::Cat::AssetCommon;
my $U = 'OpenILS::Application::AppUtils';

# A list of LDR/06 values from http://loc.gov/marc
my %record_types = (
        a => 'bib',
        c => 'bib',
        d => 'bib',
        e => 'bib',
        f => 'bib',
        g => 'bib',
        i => 'bib',
        j => 'bib',
        k => 'bib',
        m => 'bib',
        o => 'bib',
        p => 'bib',
        r => 'bib',
        t => 'bib',
        u => 'holdings',
        v => 'holdings',
        x => 'holdings',
        y => 'holdings',
        z => 'auth',
      ' ' => 'bib',
);

sub initialize {}
sub child_init {}

# --------------------------------------------------------------------------------
# Biblio ingest

sub create_bib_queue {
    my $self = shift;
    my $client = shift;
    my $auth = shift;
    my $name = shift;
    my $owner = shift;
    my $type = shift;
    my $import_def = shift;

    my $e = new_editor(authtoken => $auth, xact => 1);

    return $e->die_event unless $e->checkauth;
    return $e->die_event unless $e->allowed('CREATE_BIB_IMPORT_QUEUE');
    $owner ||= $e->requestor->id;

    if ($e->search_vandelay_bib_queue( {name => $name, owner => $owner, queue_type => $type})->[0]) {
        $e->rollback;
        return OpenILS::Event->new('BIB_QUEUE_EXISTS') 
    }

    my $queue = new Fieldmapper::vandelay::bib_queue();
    $queue->name( $name );
    $queue->owner( $owner );
    $queue->queue_type( $type ) if ($type);
    $queue->item_attr_def( $import_def ) if ($import_def);

    my $new_q = $e->create_vandelay_bib_queue( $queue );
    return $e->die_event unless ($new_q);
    $e->commit;

    return $new_q;
}
__PACKAGE__->register_method(  
    api_name   => "open-ils.vandelay.bib_queue.create",
    method     => "create_bib_queue",
    api_level  => 1,
    argc       => 4,
);                      


sub create_auth_queue {
    my $self = shift;
    my $client = shift;
    my $auth = shift;
    my $name = shift;
    my $owner = shift;
    my $type = shift;

    my $e = new_editor(authtoken => $auth, xact => 1);

    return $e->die_event unless $e->checkauth;
    return $e->die_event unless $e->allowed('CREATE_AUTHORITY_IMPORT_QUEUE');
    $owner ||= $e->requestor->id;

    if ($e->search_vandelay_bib_queue({name => $name, owner => $owner, queue_type => $type})->[0]) {
        $e->rollback;
        return OpenILS::Event->new('AUTH_QUEUE_EXISTS') 
    }

    my $queue = new Fieldmapper::vandelay::authority_queue();
    $queue->name( $name );
    $queue->owner( $owner );
    $queue->queue_type( $type ) if ($type);

    my $new_q = $e->create_vandelay_authority_queue( $queue );
    $e->die_event unless ($new_q);
    $e->commit;

    return $new_q;
}
__PACKAGE__->register_method(  
    api_name   => "open-ils.vandelay.authority_queue.create",
    method     => "create_auth_queue",
    api_level  => 1,
    argc       => 3,
);                      

sub add_record_to_bib_queue {
    my $self = shift;
    my $client = shift;
    my $auth = shift;
    my $queue = shift;
    my $marc = shift;
    my $purpose = shift;
    my $bib_source = shift;

    my $e = new_editor(authtoken => $auth, xact => 1);

    $queue = $e->retrieve_vandelay_bib_queue($queue);

    return $e->die_event unless $e->checkauth;
    return $e->die_event unless
        ($e->allowed('CREATE_BIB_IMPORT_QUEUE', undef, $queue) ||
         $e->allowed('CREATE_BIB_IMPORT_QUEUE'));

    my $new_rec = _add_bib_rec($e, $marc, $queue->id, $purpose, $bib_source);

    return $e->die_event unless ($new_rec);
    $e->commit;
    return $new_rec;
}
__PACKAGE__->register_method(  
    api_name   => "open-ils.vandelay.queued_bib_record.create",
    method     => "add_record_to_bib_queue",
    api_level  => 1,
    argc       => 3,
);                      

sub _add_bib_rec {
    my $e = shift;
    my $marc = shift;
    my $queue = shift;
    my $purpose = shift;
    my $bib_source = shift;

    my $rec = new Fieldmapper::vandelay::queued_bib_record();
    $rec->marc( $marc );
    $rec->queue( $queue );
    $rec->purpose( $purpose ) if ($purpose);
    $rec->bib_source($bib_source);

    return $e->create_vandelay_queued_bib_record( $rec );
}

sub add_record_to_authority_queue {
    my $self = shift;
    my $client = shift;
    my $auth = shift;
    my $queue = shift;
    my $marc = shift;
    my $purpose = shift;

    my $e = new_editor(authtoken => $auth, xact => 1);

    $queue = $e->retrieve_vandelay_authority_queue($queue);

    return $e->die_event unless $e->checkauth;
    return $e->die_event unless
        ($e->allowed('CREATE_AUTHORITY_IMPORT_QUEUE', undef, $queue) ||
         $e->allowed('CREATE_AUTHORITY_IMPORT_QUEUE'));

    my $new_rec = _add_auth_rec($e, $marc, $queue->id, $purpose);

    return $e->die_event unless ($new_rec);
    $e->commit;
    return $new_rec;
}
__PACKAGE__->register_method(
    api_name   => "open-ils.vandelay.queued_authority_record.create",
    method     => "add_record_to_authority_queue",
    api_level  => 1,
    argc       => 3,
);

sub _add_auth_rec {
    my $e = shift;
    my $marc = shift;
    my $queue = shift;
    my $purpose = shift;

    my $rec = new Fieldmapper::vandelay::queued_authority_record();
    $rec->marc( $marc );
    $rec->queue( $queue );
    $rec->purpose( $purpose ) if ($purpose);

    return $e->create_vandelay_queued_authority_record( $rec );
}

sub process_spool {
    my $self = shift;
    my $client = shift;
    my $auth = shift;
    my $fingerprint = shift || '';
    my $queue_id = shift;
    my $purpose = shift;
    my $filename = shift;
    my $bib_source = shift;

    my $e = new_editor(authtoken => $auth, xact => 1);
    return $e->die_event unless $e->checkauth;

    my $queue;
    my $type = $self->{record_type};

    if($type eq 'bib') {
        $queue = $e->retrieve_vandelay_bib_queue($queue_id) or return $e->die_event;
    } else {
        $queue = $e->retrieve_vandelay_authority_queue($queue_id) or return $e->die_event;
    }

    my $evt = check_queue_perms($e, $type, $queue);
    return $evt if ($evt);

    my $cache = new OpenSRF::Utils::Cache();

    if($fingerprint) {
        my $data = $cache->get_cache('vandelay_import_spool_' . $fingerprint);
        $purpose = $data->{purpose};
        $filename = $data->{path};
        $bib_source = $data->{bib_source};
    }

    unless(-r $filename) {
        $logger->error("unable to read MARC file $filename");
        return -1; # make this an event XXX
    }

    $logger->info("vandelay spooling $fingerprint purpose=$purpose file=$filename");

    my $marctype = 'USMARC'; 

    open F, $filename;
    $marctype = 'XML' if (getc(F) =~ /^\D/o);
    close F;

    my $batch = new MARC::Batch ($marctype, $filename);
    $batch->strict_off;

    my $response_scale = 10;
    my $count = 0;
    my $r = -1;
    while (try { $r = $batch->next } otherwise { $r = -1 }) {
        if ($r == -1) {
            $logger->warn("Processing of record $count in set $filename failed.  Skipping this record");
            $count++;
        }

        $logger->info("processing record $count");

        try {
            (my $xml = $r->as_xml_record()) =~ s/\n//sog;
            $xml =~ s/^<\?xml.+\?\s*>//go;
            $xml =~ s/>\s+</></go;
            $xml =~ s/\p{Cc}//go;
            $xml = $U->entityize($xml);
            $xml =~ s/[\x00-\x1f]//go;

            my $qrec;
            # Check the leader to ensure we've got something resembling the expected
            # Allow spaces to give records the benefit of the doubt
            my $ldr_type = substr($r->leader(), 6, 1);
            if ($type eq 'bib' && ($record_types{$ldr_type}) eq 'bib' || $ldr_type eq ' ') {
                $qrec = _add_bib_rec( $e, $xml, $queue_id, $purpose, $bib_source ) or return $e->die_event;
            } elsif ($type eq 'auth' && ($record_types{$ldr_type}) eq 'auth' || $ldr_type eq ' ') {
                $qrec = _add_auth_rec( $e, $xml, $queue_id, $purpose ) or return $e->die_event;
            } else {
                # I don't know how to handle this type; rock on
                $logger->error("In process_spool(), type was $type and leader type was $ldr_type ; not currently supported");
                next;
            }

            if($self->api_name =~ /stream_results/ and $qrec) {
                $client->respond($qrec->id)
            } else {
                $client->respond($count) if (++$count % $response_scale) == 0;
                $response_scale *= 10 if ($count == ($response_scale * 10));
            }
        } catch Error with {
            my $error = shift;
            $logger->warn("Encountered a bad record at Vandelay ingest: ".$error);
        }
    }

    $e->commit;
    unlink($filename);
    $cache->delete_cache('vandelay_import_spool_' . $fingerprint) if $fingerprint;
    return $count;
}

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib.process_spool",
    method      => "process_spool",
    api_level   => 1,
    argc        => 3,
    max_chunk_size => 0,
    record_type => 'bib'
);                      
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth.process_spool",
    method      => "process_spool",
    api_level   => 1,
    argc        => 3,
    max_chunk_size => 0,
    record_type => 'auth'
);                      

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib.process_spool.stream_results",
    method      => "process_spool",
    api_level   => 1,
    argc        => 3,
    stream      => 1,
    max_chunk_size => 0,
    record_type => 'bib'
);                      
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth.process_spool.stream_results",
    method      => "process_spool",
    api_level   => 1,
    argc        => 3,
    stream      => 1,
    max_chunk_size => 0,
    record_type => 'auth'
);

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.records.retrieve",
    method      => 'retrieve_queued_records',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'bib'
);
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_queue.records.retrieve",
    method      => 'retrieve_queued_records',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'auth'
);

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.records.matches.retrieve",
    method      => 'retrieve_queued_records',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'bib',
    signature   => {
        desc => q/Only retrieve queued bib records that have matches against existing records/
    }
);
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_queue.records.matches.retrieve",
    method      => 'retrieve_queued_records',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'auth',
    signature   => {
        desc => q/Only retrieve queued authority records that have matches against existing records/
    }

);

sub retrieve_queued_records {
    my($self, $conn, $auth, $queue_id, $options) = @_;
    my $e = new_editor(authtoken => $auth, xact => 1);
    return $e->die_event unless $e->checkauth;
    $options ||= {};
    my $limit = $$options{limit} || 20;
    my $offset = $$options{offset} || 0;

    my $type = $self->{record_type};
    my $queue;
    if($type eq 'bib') {
        $queue = $e->retrieve_vandelay_bib_queue($queue_id) or return $e->die_event;
    } else {
        $queue = $e->retrieve_vandelay_authority_queue($queue_id) or return $e->die_event;
    }
    my $evt = check_queue_perms($e, $type, $queue);
    return $evt if ($evt);

    my $class = ($type eq 'bib') ? 'vqbr' : 'vqar';
    my $search = ($type eq 'bib') ? 
        'search_vandelay_queued_bib_record' : 'search_vandelay_queued_authority_record';
    my $retrieve = ($type eq 'bib') ? 
        'retrieve_vandelay_queued_bib_record' : 'retrieve_vandelay_queued_authority_record';

    my $filter = ($$options{non_imported}) ? {import_time => undef} : {};

    my $record_ids;
    if($self->api_name =~ /matches/) {
        # fetch only matched records
        $record_ids = queued_records_with_matches($e, $type, $queue_id, $limit, $offset, $filter);
    } else {
        # fetch all queue records
        $record_ids = $e->$search([
                {queue => $queue_id, %$filter}, 
                {order_by => {$class => 'id'}, limit => $limit, offset => $offset}
            ],
            {idlist => 1}
        );
    }


    for my $rec_id (@$record_ids) {
        my $params = {   
            flesh => 1,
            flesh_fields => {$class => ['attributes', 'matches']},
        };
        my $rec = $e->$retrieve([$rec_id, $params]);
        $rec->clear_marc if $$options{clear_marc};
        $conn->respond($rec);
    }
    $e->rollback;
    return undef;
}

sub check_queue_perms {
    my($e, $type, $queue) = @_;
    if ($type eq 'bib') {
        return $e->die_event unless
            ($e->allowed('CREATE_BIB_IMPORT_QUEUE', undef, $queue) ||
             $e->allowed('CREATE_BIB_IMPORT_QUEUE'));
    } else {
        return $e->die_event unless
            ($e->allowed('CREATE_AUTHORITY_IMPORT_QUEUE', undef, $queue) ||
             $e->allowed('CREATE_AUTHORITY_IMPORT_QUEUE'));
    }

    return undef;
}

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_record.list.import",
    method      => 'import_record_list',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'bib'
);

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_record.list.import",
    method      => 'import_record_list',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'auth'
);

sub import_record_list {
    my($self, $conn, $auth, $rec_ids, $args) = @_;
    my $e = new_editor(authtoken => $auth, xact => 1);
    return $e->die_event unless $e->checkauth;
    $args ||= {};
    my $err = import_record_list_impl($self, $conn, $rec_ids, $e->requestor, $args);
    $e->rollback;
    return $err if $err;
    return {complete => 1};
}


__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.import",
    method      => 'import_queue',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    max_chunk_size => 0,
    record_type => 'bib'
);

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_queue.import",
    method      => 'import_queue',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    max_chunk_size => 0,
    record_type => 'auth'
);
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.nomatch.import",
    method      => 'import_queue',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    signature   => {
        desc => q/Only import records that have no collisions/
    },
    max_chunk_size => 0,
    record_type => 'bib'
);

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_queue.nomatch.import",
    method      => 'import_queue',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    signature   => {
        desc => q/Only import records that have no collisions/
    },
    max_chunk_size => 0,
    record_type => 'auth'
);
sub import_queue {
    my($self, $conn, $auth, $q_id, $options) = @_;
    my $e = new_editor(authtoken => $auth, xact => 1);
    return $e->die_event unless $e->checkauth;
    $options ||= {};
    my $type = $self->{record_type};
    my $class = ($type eq 'bib') ? 'vqbr' : 'vqar';

    my $query = {queue => $q_id, import_time => undef};

    if($self->api_name =~ /nomatch/) {
        my $matched_recs = queued_records_with_matches($e, $type, $q_id, undef, undef, {import_time => undef});
        $query->{id} = {'not in' => $matched_recs} if @$matched_recs;
    }

    my $search = ($type eq 'bib') ? 
        'search_vandelay_queued_bib_record' : 'search_vandelay_queued_authority_record';
    my $rec_ids = $e->$search($query, {idlist => 1});
    my $err = import_record_list_impl($self, $conn, $rec_ids, $e->requestor, $options);
    try {$e->rollback} otherwise {}; # only using this to make the read authoritative -- don't die from it
    return $err if $err;
    return {complete => 1};
}

# returns a list of queued record IDs for a given queue that 
# have at least one entry in the match table
sub queued_records_with_matches {
    my($e, $type, $q_id, $limit, $offset, $filter) = @_;

    my $match_class = 'vbm';
    my $rec_class = 'vqbr';
    if($type eq 'auth') {
        $match_class = 'vam';
         $rec_class = 'vqar';
    }

    $filter ||= {};
    $filter->{queue} = $q_id;

    my $query = {
        distinct => 1, 
        select => {$match_class => ['queued_record']}, 
        from => {
            $match_class => {
                $rec_class => {
                    field => 'id',
                    fkey => 'queued_record',
                    filter => $filter,
                }
            }
        }
    };        

    if($limit or defined $offset) {
        $limit ||= 20;
        $offset ||= 0;
        $query->{limit} = $limit;
        $query->{offset} = $offset;
    }

    my $data = $e->json_query($query);
    return [ map {$_->{queued_record}} @$data ];
}

sub import_record_list_impl {
    my($self, $conn, $rec_ids, $requestor, $args) = @_;

    my $overlay_map = $args->{overlay_map} || {};
    my $type = $self->{record_type};
    my $total = @$rec_ids;
    my $count = 0;
    my %queues;

    my $step = 1;

    my $auto_overlay_exact = $$args{auto_overlay_exact};
    my $auto_overlay_1match = $$args{auto_overlay_1match};
    my $merge_profile = $$args{merge_profile};
    my $bib_source = $$args{bib_source};
    my $report_all = $$args{report_all};
    my $import_no_match = $$args{import_no_match};

    my $overlay_func = 'vandelay.overlay_bib_record';
    my $auto_overlay_func = 'vandelay.auto_overlay_bib_record';
    my $retrieve_func = 'retrieve_vandelay_queued_bib_record';
    my $update_func = 'update_vandelay_queued_bib_record';
    my $search_func = 'search_vandelay_queued_bib_record';
    my $retrieve_queue_func = 'retrieve_vandelay_bib_queue';
    my $update_queue_func = 'update_vandelay_bib_queue';
    my $rec_class = 'vqbr';

    my %bib_sources;
    my $editor = new_editor();
    my $sources = $editor->search_config_bib_source({id => {'!=' => undef}});

    foreach my $src (@$sources) {
        $bib_sources{$src->id} = $src->source;
    }

    if($type eq 'auth') {
        $overlay_func =~ s/bib/auth/o;
        $auto_overlay_func = s/bib/auth/o;
        $retrieve_func =~ s/bib/authority/o;
        $retrieve_queue_func =~ s/bib/authority/o;
        $update_queue_func =~ s/bib/authority/o;
        $update_func =~ s/bib/authority/o;
        $search_func =~ s/bib/authority/o;
        $rec_class = 'vqar';
    }

    my @success_rec_ids;
    for my $rec_id (@$rec_ids) {

        my $overlay_target = $overlay_map->{$rec_id};

        my $error = 0;
        my $e = new_editor(xact => 1);
        $e->requestor($requestor);

        my $rec = $e->$retrieve_func([
            $rec_id,
            {   flesh => 1,
                flesh_fields => { $rec_class => ['matches']},
            }
        ]);

        unless($rec) {
            $conn->respond({total => $total, progress => ++$count, imported => $rec_id, err_event => $e->event});
            $e->rollback;
            next;
        }

        if($rec->import_time) {
            $e->rollback;
            next;
        }

        $queues{$rec->queue} = 1;

        my $record;
        my $imported = 0;

        if(defined $overlay_target) {
            # Caller chose an explicit overlay target

            my $res = $e->json_query(
                {
                    from => [
                        $overlay_func,
                        $rec->id, 
                        $overlay_target, 
                        $merge_profile
                    ]
                }
            );

            if($res and ($res = $res->[0])) {

                if($res->{$overlay_func} eq 't') {
                    $logger->info("vl: $type direct overlay succeeded for queued rec " . 
                        $rec->id . " and overlay target $overlay_target");
                    $imported = 1;
                }

            } else {
                $error = 1;
                $logger->error("vl: Error attempting overlay with func=$overlay_func, profile=$merge_profile, record=$rec_id");
            }

        } else {

            if($auto_overlay_1match) { 
                # caller says to overlay if there is exactly 1 match

                my %match_recs = map { $_->eg_record => 1 } @{$rec->matches};

                if( scalar(keys %match_recs) == 1) { # all matches point to the same record

                    my $res = $e->json_query(
                        {
                            from => [
                                $overlay_func,
                                $rec->id, 
                                $rec->matches->[0]->eg_record,
                                $merge_profile
                            ]
                        }
                    );

                    if($res and ($res = $res->[0])) {
    
                        if($res->{$overlay_func} eq 't') {
                            $logger->info("vl: $type overlay-1match succeeded for queued rec " . $rec->id);
                            $imported = 1;
                        }

                    } else {
                        $error = 1;
                        $logger->error("vl: Error attempting overlay with func=$overlay_func, profile=$merge_profile, record=$rec_id");
                    }
                }
            }

            if(!$imported and !$error and $auto_overlay_exact and scalar(@{$rec->matches}) == 1 ) {
                
                # caller says to overlay if there is an /exact/ match

                my $res = $e->json_query(
                    {
                        from => [
                            $auto_overlay_func,
                            $rec->id, 
                            $merge_profile
                        ]
                    }
                );

                if($res and ($res = $res->[0])) {

                    if($res->{$auto_overlay_func} eq 't') {
                        $logger->info("vl: $type auto-overlay succeeded for queued rec " . $rec->id);
                        $imported = 1;
                    }

                } else {
                    $error = 1;
                    $logger->error("vl: Error attempting overlay with func=$auto_overlay_func, profile=$merge_profile, record=$rec_id");
                }
            }

            if(!$imported and !$error and $import_no_match and scalar(@{$rec->matches}) == 0) { # match count test should not be necessary, but is a good fail-safe
            
                # No overlay / merge occurred.  Do a traditional record import by creating a new record
            
                if($type eq 'bib') {
                    $record = OpenILS::Application::Cat::BibCommon->biblio_record_xml_import($e, $rec->marc, $bib_sources{$rec->bib_source});
                } else {

                    $record = OpenILS::Application::Cat::AuthCommon->import_authority_record($e, $rec->marc); #$source);
                }

                if($U->event_code($record)) {

                    $e->event($record); 
                    $e->rollback;

                } else {

                    $logger->info("vl: successfully imported new $type record");
                    $rec->imported_as($record->id);
                    $rec->import_time('now');

                    $imported = 1 if $e->$update_func($rec);
                }
            }
        }

        if($imported) {
            push @success_rec_ids, $rec_id;
            $e->commit;
        } else {
            # Send an update whenever there's an error
            $conn->respond({total => $total, progress => ++$count, imported => $rec_id, err_event => $e->event});
        }

        if($report_all or (++$count % $step) == 0) {
            $conn->respond({total => $total, progress => $count, imported => $rec_id});
            # report often at first, climb quickly, then hold steady
            $step *= 2 unless $step == 256;
        }
    }

    # see if we need to mark any queues as complete
    for my $q_id (keys %queues) {

    	my $e = new_editor(xact => 1);
        my $remaining = $e->$search_func(
            [{queue => $q_id, import_time => undef}, {limit =>1}], {idlist => 1});

        unless(@$remaining) {
            my $queue = $e->$retrieve_queue_func($q_id);

            unless($U->is_true($queue->complete)) {
                $queue->complete('t');
                $e->$update_queue_func($queue) or return $e->die_event;
                $e->commit;
                next;
            }
        } 
    	$e->rollback;
    }

    import_record_asset_list_impl($conn, \@success_rec_ids, $requestor);

    $conn->respond({total => $total, progress => $count});
    return undef;
}


__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.owner.retrieve",
    method      => 'owner_queue_retrieve',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'bib'
);
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.authority_queue.owner.retrieve",
    method      => 'owner_queue_retrieve',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'auth'
);

sub owner_queue_retrieve {
    my($self, $conn, $auth, $owner_id, $filters) = @_;
    my $e = new_editor(authtoken => $auth, xact => 1);
    return $e->die_event unless $e->checkauth;
    $owner_id = $e->requestor->id; # XXX add support for viewing other's queues?
    my $queues;
    $filters ||= {};
    my $search = {owner => $owner_id};
    $search->{$_} = $filters->{$_} for keys %$filters;

    if($self->{record_type} eq 'bib') {
        $queues = $e->search_vandelay_bib_queue(
            [$search, {order_by => {vbq => 'evergreen.lowercase(name)'}}]);
    } else {
        $queues = $e->search_vandelay_authority_queue(
            [$search, {order_by => {vaq => 'evergreen.lowercase(name)'}}]);
    }
    $conn->respond($_) for @$queues;
    $e->rollback;
    return undef;
}

__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.delete",
    method      => "delete_queue",
    api_level   => 1,
    argc        => 2,
    record_type => 'bib'
);            
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_queue.delete",
    method      => "delete_queue",
    api_level   => 1,
    argc        => 2,
    record_type => 'auth'
);  

sub delete_queue {
    my($self, $conn, $auth, $q_id) = @_;
    my $e = new_editor(xact => 1, authtoken => $auth);
    return $e->die_event unless $e->checkauth;
    if($self->{record_type} eq 'bib') {
        return $e->die_event unless $e->allowed('CREATE_BIB_IMPORT_QUEUE');
        my $queue = $e->retrieve_vandelay_bib_queue($q_id)
            or return $e->die_event;
        $e->delete_vandelay_bib_queue($queue)
            or return $e->die_event;
    } else {
           return $e->die_event unless $e->allowed('CREATE_AUTHORITY_IMPORT_QUEUE');
        my $queue = $e->retrieve_vandelay_authority_queue($q_id)
            or return $e->die_event;
        $e->delete_vandelay_authority_queue($queue)
            or return $e->die_event;
    }
    $e->commit;
    return 1;
}


__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.queued_bib_record.html",
    method      => 'queued_record_html',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'bib'
);
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.queued_authority_record.html",
    method      => 'queued_record_html',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'auth'
);

sub queued_record_html {
    my($self, $conn, $auth, $rec_id) = @_;
    my $e = new_editor(xact=>1,authtoken => $auth);
    return $e->die_event unless $e->checkauth;
    my $rec;
    if($self->{record_type} eq 'bib') {
        $rec = $e->retrieve_vandelay_queued_bib_record($rec_id)
            or return $e->die_event;
    } else {
        $rec = $e->retrieve_vandelay_queued_authority_record($rec_id)
            or return $e->die_event;
    }

    $e->rollback;
    return $U->simplereq(
        'open-ils.search',
        'open-ils.search.biblio.record.html', undef, 1, $rec->marc);
}


__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.bib_queue.summary.retrieve", 
    method      => 'retrieve_queue_summary',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'bib'
);
__PACKAGE__->register_method(  
    api_name    => "open-ils.vandelay.auth_queue.summary.retrieve",
    method      => 'retrieve_queue_summary',
    api_level   => 1,
    argc        => 2,
    stream      => 1,
    record_type => 'auth'
);

sub retrieve_queue_summary {
    my($self, $conn, $auth, $queue_id) = @_;
    my $e = new_editor(xact=>1, authtoken => $auth);
    return $e->die_event unless $e->checkauth;

    my $queue;
    my $type = $self->{record_type};
    if($type eq 'bib') {
        $queue = $e->retrieve_vandelay_bib_queue($queue_id)
            or return $e->die_event;
    } else {
        $queue = $e->retrieve_vandelay_authority_queue($queue_id)
            or return $e->die_event;
    }

    my $evt = check_queue_perms($e, $type, $queue);
    return $evt if $evt;

    my $search = 'search_vandelay_queued_bib_record';
    $search =~ s/bib/authority/ if $type ne 'bib';

    return {
        queue => $queue,
        total => scalar(@{$e->$search({queue => $queue_id}, {idlist=>1})}),
        imported => scalar(@{$e->$search({queue => $queue_id, import_time => {'!=' => undef}}, {idlist=>1})}),
    };
}

# --------------------------------------------------------------------------------
# Given a list of queued record IDs, imports all items attached to those records
# --------------------------------------------------------------------------------
sub import_record_asset_list_impl {
    my($conn, $rec_ids, $requestor) = @_;

    my $total = @$rec_ids;
    my $try_count = 0;
    my $in_count = 0;
    my $roe = new_editor(xact=> 1, requestor => $requestor);

    for my $rec_id (@$rec_ids) {
        my $rec = $roe->retrieve_vandelay_queued_bib_record($rec_id);
        next unless $rec and $rec->import_time;
        my $item_ids = $roe->search_vandelay_import_item({record => $rec->id}, {idlist=>1});

        for my $item_id (@$item_ids) {
            my $e = new_editor(requestor => $requestor, xact => 1);
            my $item = $e->retrieve_vandelay_import_item($item_id);
            $try_count++;

            # --------------------------------------------------------------------------------
            # Find or create the volume
            # --------------------------------------------------------------------------------
            my ($vol, $evt) =
                OpenILS::Application::Cat::AssetCommon->find_or_create_volume(
                    $e, $item->call_number, $rec->imported_as, $item->owning_lib);

            if($evt) {
                respond_with_status($conn, $total, $try_count, $in_count, $evt);
                next;
            }

            # --------------------------------------------------------------------------------
            # Create the new copy
            # --------------------------------------------------------------------------------
            my $copy = Fieldmapper::asset::copy->new;
            $copy->loan_duration(2);
            $copy->fine_level(2);
            $copy->barcode($item->barcode);
            $copy->location($item->location);
            $copy->circ_lib($item->circ_lib || $item->owning_lib);
            $copy->status( defined($item->status) ? $item->status : OILS_COPY_STATUS_IN_PROCESS );
            $copy->circulate($item->circulate);
            $copy->deposit($item->deposit);
            $copy->deposit_amount($item->deposit_amount);
            $copy->ref($item->ref);
            $copy->holdable($item->holdable);
            $copy->price($item->price);
            $copy->circ_as_type($item->circ_as_type);
            $copy->alert_message($item->alert_message);
            $copy->opac_visible($item->opac_visible);
            $copy->circ_modifier($item->circ_modifier);

            # --------------------------------------------------------------------------------
            # see if a valid circ_modifier was provided
            # --------------------------------------------------------------------------------
            #if($copy->circ_modifier and not $e->retrieve_config_circ_modifier($item->circ_modifier)) {
            if($copy->circ_modifier and not $e->search_config_circ_modifier({code=>$item->circ_modifier})->[0]) {
                respond_with_status($conn, $total, $try_count, $in_count, $e->die_event);
                next;
            }

            if($evt = OpenILS::Application::Cat::AssetCommon->create_copy($e, $vol, $copy)) {
                try { $e->rollback } otherwise {}; # sometimes calls die_event, sometimes not
                respond_with_status($conn, $total, $try_count, $in_count, $evt);
                next;
            }

            # --------------------------------------------------------------------------------
            # create copy notes
            # --------------------------------------------------------------------------------
            $evt = OpenILS::Application::Cat::AssetCommon->create_copy_note(
                $e, $copy, '', $item->pub_note, 1) if $item->pub_note;

            if($evt) {
                respond_with_status($conn, $total, $try_count, $in_count, $evt);
                next;
            }

            $evt = OpenILS::Application::Cat::AssetCommon->create_copy_note(
                $e, $copy, '', $item->priv_note) if $item->priv_note;

            if($evt) {
                respond_with_status($conn, $total, $try_count, $in_count, $evt);
                next;
            }

            # --------------------------------------------------------------------------------
            # Item import succeeded
            # --------------------------------------------------------------------------------
            $e->commit;
            respond_with_status($conn, $total, $try_count, ++$in_count, undef, imported_as => $copy->id);
        }
    }
    $roe->rollback;
    return undef;
}


sub respond_with_status {
    my($conn, $total, $try_count, $success_count, $err, %args) = @_;
    $conn->respond({
        total => $total, 
        progress => $try_count, 
        err_event => $err, 
        success_count => $success_count, %args }) if $err or ($try_count % 5 == 0);
}


1;
