var notifier = require('node-notifier');

module.exports = function(arg){
	if( arg > 0 ){
	  notifier.notify({
	  	title: "Something Failed",
	  	message: "sucking at something is the first step to being sort of good at something",
	  	sound: 'Sosumi'	  	
	  });
	  return;
	} else if ( arg == 0){
	  notifier.notify({
	  	title: "oops",
	  	message: "All tests passed! This is either really great or really bad.",
	  	sound: 'Purr'
	  });	
	  return
	}
};