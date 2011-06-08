package OpenILS::Application::Trigger::Validator;
use strict; use warnings;
use DateTime;
use DateTime::Format::ISO8601;
use OpenSRF::Utils qw/:datetime/;
use OpenSRF::Utils::Logger qw/:logger/;
use OpenILS::Const qw/:const/;
sub fourty_two { return 42 }
sub NOOP_True { return 1 }
sub NOOP_False { return 0 }

sub CircIsOpen {
    my $self = shift;
    my $env = shift;

    return 0 if (defined($env->{target}->checkin_time));

    if ($env->{params}->{min_target_age}) {
        $env->{params}->{target_age_field} = 'xact_start';
        return 0 if (!$self->MinPassiveTargetAge($env));
    }

    return 1;
}

sub MinPassiveTargetAge {
    my $self = shift;
    my $env = shift;
    my $target = $env->{target};
    my $delay_field = $env->{params}->{target_age_field} || $env->{event}->event_def->delay_field;

    unless($env->{params}->{min_target_age}) {
        $logger->warn("'min_target_age' parameter required for MinPassiveTargetAge validator");
        return 0; # no-op false
    }

    unless($delay_field) {
        $logger->warn("'target_age_field' parameter or delay_field required for MinPassiveTargetAge validator");
        return 0; # no-op false
    }

    my $delay_field_ts = DateTime::Format::ISO8601->new->parse_datetime(cleanse_ISO8601($target->$delay_field()));

    # to get the minimum time that the target must have aged to, add the min age to the delay field
    $delay_field_ts->add( seconds => interval_to_seconds( $env->{params}->{min_target_age} ) );

    return 1 if $delay_field_ts <= DateTime->now;
    return 0;
}

sub CircIsOverdue {
    my $self = shift;
    my $env = shift;
    my $circ = $env->{target};

    return 0 if $circ->checkin_time;
    return 0 if $circ->stop_fines and not $circ->stop_fines =~ /MAXFINES|LONGOVERDUE/;

    if ($env->{params}->{min_target_age}) {
        $env->{params}->{target_age_field} = 'xact_start';
        return 0 if (!$self->MinPassiveTargetAge($env));
    }

    my $due_date = DateTime::Format::ISO8601->new->parse_datetime(cleanse_ISO8601($circ->due_date));
    return 0 if $due_date > DateTime->now;

    return 1;
}

sub HoldIsAvailable {
    my $self = shift;
    my $env = shift;

    my $hold = $env->{target};

    return 1 if 
        !$hold->cancel_time and
        $hold->capture_time and 
        $hold->current_copy and
        $hold->current_copy->status == OILS_COPY_STATUS_ON_HOLDS_SHELF;

    return 0;
}

sub HoldIsCancelled {
    my $self = shift;
    my $env = shift;

    my $hold = $env->{target};

    return ($hold->cancel_time) ? 1 : 0;
}

1;
