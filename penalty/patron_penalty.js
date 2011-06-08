function go() {

/* load the lib script */
load_lib('circ/circ_lib.js');
load_lib('JSON_v1.js');
log_vars('patron_penalty');

var config = findGroupConfig(patronProfile);

if( config ) {

	/* check the fine limit */
	if( config.fineThreshold >= 0 && patronFines >= config.fineThreshold ) 
		result.fatalEvents.push('PATRON_EXCEEDS_FINES');

	/* check the overdue limit */
	if( config.overdueThreshold >= 0 && patronOverdueCount >= config.overdueThreshold )
		result.fatalEvents.push('PATRON_EXCEEDS_OVERDUE_COUNT');

} else {
	log_warn("profile has no configured information: " + patronProfile);
}






} go();


