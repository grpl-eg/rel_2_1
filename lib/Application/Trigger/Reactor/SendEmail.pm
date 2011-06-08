package OpenILS::Application::Trigger::Reactor::SendEmail;
use strict; use warnings;
use Error qw/:try/;
use Data::Dumper;
use Email::Send;
use OpenSRF::Utils::SettingsClient;
use OpenILS::Application::Trigger::Reactor;
use OpenSRF::Utils::Logger qw/:logger/;
use utf8;
$Data::Dumper::Indent = 0;

use base 'OpenILS::Application::Trigger::Reactor';

my $log = 'OpenSRF::Utils::Logger';

sub ABOUT {
    return <<ABOUT;

The SendEmail Reactor Module attempts to email out, via Email::Send,
whatever is constructed by the template passed in from the Event Definition.

The SMTP server specified by the /opensrf/default/email_notify/smtp_server
setting is used to send the email, and the value at
/opensrf/default/email_notify/sender_address is passed into the template as
the 'default_sender' variable.

No default template is assumed, and all information other than the
default_sender that the system provides is expected to be gathered by the
Event Definition through either Environment or Parameter definitions.

ABOUT
}

sub handler {
    my $self = shift;
    my $env = shift;

    my $conf = OpenSRF::Utils::SettingsClient->new;
    my $smtp = $conf->config_value('email_notify', 'smtp_server');
    $$env{default_sender} = $conf->config_value('email_notify', 'sender_address');

    my $text = $self->run_TT($env);
    return 0 if (!$text);

    my $sender = Email::Send->new({mailer => 'SMTP'});
    $sender->mailer_args([Host => $smtp]);

    my $stat;
    my $err;

    utf8::encode($text); # prevent "Wide character" errors in Email::Send

    try {
        $stat = $sender->send($text);
    } catch Error with {
        $err = $stat = shift;
        $logger->error("SendEmail Reactor: Email failed with error: $err");
    };

    if( !$err and $stat and $stat->type eq 'success' ) {
        $logger->info("SendEmail Reactor: successfully sent email");
        return 1;
    } else {
        $logger->warn("SendEmail Reactor: unable to send email: ".Dumper($stat));
        $text =~ s/\n//og;
        $logger->warn("SendEmail Reactor: failed email template: $text");
        return 0;
    }

}

1;

