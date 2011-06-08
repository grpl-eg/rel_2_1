package OpenILS::Utils::SpiderMonkey;
use strict; use warnings;
use OpenSRF::Utils::Logger qw(:logger);
use OpenSRF::EX qw(:try);
use OpenILS::Utils::ScriptRunner;
use base 'OpenILS::Utils::ScriptRunner';
use JavaScript::SpiderMonkey;
use LWP::UserAgent;
use XML::LibXML;
use Time::HiRes qw/time/;
use vars qw/%_paths/;

sub new {
	my ( $class, %params ) = @_;
	$class = ref($class) || $class;
	$params{paths} ||= [];

	my $self = { file => $params{file}, libs => $params{libs}, _path => {%_paths} };
	bless( $self, $class );

	$self->add_path($_) for @{$params{paths}};
	return $self;
}

sub context {
	my( $self, $context ) = @_;
	$self->{ctx} = $context if $context;
	return $self->{ctx};
}

sub init {
	my $self = shift;
	my $js = JavaScript::SpiderMonkey->new();
	$js->init();

	$js->function_set(perl_print	=> sub { print "@_\n"; } );
	$js->function_set(perl_warn	=> sub { warn @_; } );
	$js->function_set(log_activity	=> sub { $logger->activity(@_); return 1;} );
	$js->function_set(log_error	=> sub { $logger->error(@_); return 1;} );
	$js->function_set(log_warn	=> sub { $logger->warn(@_); return 1;} );
	$js->function_set(log_info	=> sub { $logger->info(@_); return 1;} );
	$js->function_set(log_debug	=> sub { $logger->debug(@_); return 1;} );
	$js->function_set(log_internal	=> sub { $logger->internal(@_); return 1;} );
	$js->function_set(debug		=> sub { $logger->debug(@_); return 1;} );
	$js->function_set(alert		=> sub { $logger->warn(@_); return 1;} );
	
	$js->function_set(load_lib	=> sub { $self->load_lib(@_); });

	# XML support functions
	$js->function_set(
		_OILS_FUNC_xmlhttprequest_send	=> sub { $self->_xmlhttprequest_send(@_); });
	$js->function_set(
		_OILS_FUNC_xml_parse_string	=> sub { $self->_parse_xml_string(@_); });
	
	$self->context($js);
	$self->load_lib($_) for @{$self->{libs}};

	return $self;
}


sub load {
	my( $self, $filename ) = @_;
	$self->{file} = $filename;
}

sub run {
	my $self = shift;
	my $file = shift() || $self->{file};
	my $js = $self->context;

	$file = $self->_find_file($file);

	if( ! open(F, $file) ) {
		$logger->error("Error opening script file: $file");
		return 0;
	}

	{	local $/ = undef;
		my $content = <F>;
		my $s = time();
		if( !$js || !$content || !$js->eval($content) ) {
			$logger->error("$file Eval failed: $@");  
			return 0;
		}
		$logger->debug("eval of $file took ". sprintf('%0.3f', time - $s) . " seconds");
	}

	close(F);
	return 1;
}

sub remove_path { 
	my( $self, $path ) = @_;
	if (ref($self)) {
		if ($self->{_path}{$path}) {
			$self->{_path}{$path} = 0;
		}
		return $self->{_path}{$path};
	} else {
		if ($_paths{$path}) {
			$_paths{$path} = 0;
		}
		return $_paths{$path};
	}
}

sub add_path { 
	my( $self, $path ) = @_;
	if (ref($self)) {
		if (!$self->{_path}{$path}) {
			$self->{_path}{$path} = 1;
		}
	} else {
		if (!$_paths{$path}) {
			$_paths{$path} = 1;
		}
	}
	return $self;
}

sub _find_file {
	my $self = shift;
	my $file = shift;
	for my $p ( keys %{ $self->{_path} } ) {
		next unless ($self->{_path}{$p});
		my $full = join('/',$p,$file);
		return $full if (-e $full);
	}
}

sub load_lib { 
	my( $self, $file ) = @_;
	if (!$self->{_loaded}{$file} && $self->run( $file )) {
		$self->{_loaded}{$file} = 1;
	}
	return $self->{_loaded}{$file};
}

sub _js_prop_name {
	my $name = shift;
	$name =~ s/^.*\.//o;
	return $name;
}

sub retrieve {
	my( $self, $key ) = @_;
	return $self->context->property_get($key);
}

sub insert_method {
	my( $self, $obj_key, $meth_name, $sub ) = @_;
	my $obj = $self->context->object_by_path( $obj_key );
	$self->context->function_set( $meth_name, $sub, $obj ) if $obj;
}


sub insert {
	my( $self, $key, $val ) = @_;
	return unless defined($key);

	if (ref($val) =~ /^Fieldmapper/o) {
		$self->insert_fm($key, $val);
	} elsif (ref($val) and $val =~ /ARRAY/o) {
		$self->insert_array($key, $val);
	} elsif (ref($val) and $val =~ /HASH/o) {
		$self->insert_hash($key, $val);
	} elsif (ref($val) and $val =~ /CODE/o) {
		$self->context->function_set( $key, $val );
	} elsif (!ref($val)) {
		if( defined($val) ) {
			$self->context->property_by_path(
				$key, $val,
				sub { $val },
				sub { my( $k, $v ) = @_; $val = $v; }
			);
		} else {
			$self->context->property_by_path($key);
		}

	} else {
		return 0;
	}

	return 1;
}

sub insert_fm {

	my( $self, $key, $fm ) = @_;
	my $ctx = $self->context;
	return undef unless ($ctx and $key and $fm);
	my $o = $ctx->object_by_path($key);
	
	for my $f ( $fm->properties ) {
		my $val = $fm->$f();
		if (ref $val) {
			$self->insert("$key.$f", $val);
		} else {
			$ctx->property_by_path(
				"$key.$f",
				$val,
				sub {
					my $k = _js_prop_name(shift());
					$fm->$k();
				}, 

				sub {
					my $k = _js_prop_name(shift());
					$fm->ischanged(1);
					$fm->$k(@_);
				}
			);
		}
	}
}

sub insert_hash {

	my( $self, $key, $hash ) = @_;
	my $ctx = $self->context;
	return undef unless ($ctx and $key and $hash);
	$ctx->object_by_path($key);
	
	for my $k ( keys %$hash ) {
		my $v = $hash->{$k};
		if (ref $v) {
			$self->insert("$key.$k", $v);
		} else {
			$ctx->property_by_path(
				"$key.$k", $v,
				sub { $hash->{_js_prop_name(shift())} },
				sub { 
					my( $key, $val ) = @_;
					$hash->{_js_prop_name($key)} = $val; }
			);
		}
	}
}

my $__array_id = 0;
sub insert_array {

	my( $self, $key, $array ) = @_;
	my $ctx = $self->context;
	return undef unless ($ctx and $key and $array);

	my $a = $ctx->array_by_path($key);
	
	my $ind = 0;
	for my $v ( @$array ) {
		if (ref $v) {
			my $elobj = $ctx->object_by_path('__tmp_arr_el'.$__array_id);
			$self->insert('__tmp_arr_el'.$__array_id, $v);
			$ctx->array_set_element_as_object( $a, $ind, $elobj );
			$__array_id++;
		} else {
			$ctx->array_set_element( $a, $ind, $v ) if defined($v);
		}
		$ind++;
	}
}

sub _xmlhttprequest_send {
	my $self = shift;
	my $id = shift;
	my $method = shift;
	my $url = shift;
	my $blocking = shift;
	my $headerlist = shift;
	my $data = shift;

	my $ctx = $self->context;

	# just so perl has access to it...
	$ctx->object_by_path('__xmlhttpreq_hash.id'.$id);

	my $headers = new HTTP::Headers;
	my @lines = split(/\n/so, $headerlist);
	for my $line (@lines) {
		if ($line =~ /^(.+?)|(.+)$/o) {
			$headers->header($1 => $2);
		}
	}

	my $ua = LWP::UserAgent->new;
	$ua->agent("OpenILS/0.1");

	my $req = HTTP::Request->new($method => $url => $headers => $data);
	my $res = $ua->request($req);

	if ($res->is_success) {
		
		$ctx->property_by_path('__xmlhttpreq_hash.id'.$id.'.responseText', $res->content);
		$ctx->property_by_path('__xmlhttpreq_hash.id'.$id.'.readyState', 4);
		$ctx->property_by_path('__xmlhttpreq_hash.id'.$id.'.statusText', $res->status_line);
		$ctx->property_by_path('__xmlhttpreq_hash.id'.$id.'.status', $res->code);

	}
		
}

sub _parse_xml_string {
	my $self = shift;
	my $string = shift;
	my $key = shift;


	my $doc;
	my $s = 0;
	try {
		$doc = XML::LibXML->new->parse_string( $string );
		$s = 1;
	} catch Error with {
		my $e = shift;
		warn "Could not parse document: $e\n";
	};
	return unless ($s);

	_JS_DOM($self->context, $key, $doc);
}

sub _JS_DOM {
	my $ctx = shift;
	my $key = shift;
	my $node = shift;

	if ($node->nodeType == 9) {
		$node = $node->documentElement;

		my $n = $node->nodeName;
		my $ns = $node->namespaceURI;
		$ns =~ s/'/\'/gso if ($ns);
		$ns = "'$ns'" if ($ns);
		$ns = 'null' unless ($ns);
		$n =~ s/'/\'/gso;

		#warn("$key = DOMImplementation().createDocument($ns,'$n');");
		$ctx->eval("$key = new DOMImplementation().createDocument($ns,'$n');");

		$key = $key.'.documentElement';
	}

	for my $a ($node->attributes) {
		my $n = $a->nodeName;
		my $v = $a->value;
		$n =~ s/'/\'/gso;
		$v =~ s/'/\'/gso;
		#warn("$key.setAttribute('$n','$v');");
		$ctx->eval("$key.setAttribute('$n','$v');");

	}

	my $k = 0;
	for my $c ($node->childNodes) {
		if ($c->nodeType == 1) {
			my $n = $c->nodeName;
			my $ns = $node->namespaceURI;

			$n =~ s/'/\'/gso;
			$ns =~ s/'/\'/gso if ($ns);
			$ns = "'$ns'" if ($ns);
			$ns = 'null' unless ($ns);

			#warn("$key.appendChild($key.ownerDocument.createElementNS($ns,'$n'));");
			$ctx->eval("$key.appendChild($key.ownerDocument.createElementNS($ns,'$n'));");
			_JS_DOM($ctx, "$key.childNodes.item($k)",$c);

		} elsif ($c->nodeType == 3) {
			my $n = $c->data;
			$n =~ s/'/\'/gso;
			#warn("$key.appendChild($key.ownerDocument.createTextNode('$n'));");
			#warn("path is $key.item($k);");
			$ctx->eval("$key.appendChild($key.ownerDocument.createTextNode('$n'));");

		} elsif ($c->nodeType == 4) {
			my $n = $c->data;
			$n =~ s/'/\'/gso;
			#warn("$key.appendChild($key.ownerDocument.createCDATASection('$n'));");
			$ctx->eval("$key.appendChild($key.ownerDocument.createCDATASection('$n'));");

		} elsif ($c->nodeType == 8) {
			my $n = $c->data;
			$n =~ s/'/\'/gso;
			#warn("$key.appendChild($key.ownerDocument.createComment('$n'));");
			$ctx->eval("$key.appendChild($key.ownerDocument.createComment('$n'));");

		} else {
			warn "ACK! I don't know how to handle node type ".$c->nodeType;
		}
		

		$k++;
	}

	return 1;
}



1;
