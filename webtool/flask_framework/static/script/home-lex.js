// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// Provide your Pool Id here
	IdentityPoolId: 'us-east-1:899aec37-549b-4c65-8697-bfc5d077353d',
});

var lexruntime = new AWS.LexRuntime();
var lexUserId = 'chatbot-demo' + Date.now();
var sessionAttributes = {};

function pushChat() {

	// if there is text to be sent...
	var wisdomText = document.getElementById('wisdom');
	if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

		// disable input to show we're sending it
		var wisdom = wisdomText.value.trim();
		wisdomText.value = '...';
		wisdomText.locked = true;

		// send it to the Lex runtime
		var params = {
			botAlias: '$LATEST',
			botName: 'SPA_Chatbot',
			inputText: wisdom,
			userId: lexUserId,
			sessionAttributes: sessionAttributes
		};
		showRequest(wisdom);
		lexruntime.postText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				showError('Error:  ' + err.message + ' (see console for details)')
			}
			if (data) {
				// capture the sessionAttributes for the next cycle
				sessionAttributes = data.sessionAttributes;
				// show response and/or error/dialog status
				showResponse(data);
			}
			// re-enable input
			wisdomText.value = '';
			wisdomText.locked = false;
		});
	}
	// we always cancel form submission
	return false;
}

function showRequest(daText) {

	var conversationDiv = document.getElementById('conversation');
	var requestPara = document.createElement("P");
	requestPara.className = 'userRequest';
	requestPara.appendChild(document.createTextNode(daText));
	conversationDiv.appendChild(requestPara);
	conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function showError(daText) {

	var conversationDiv = document.getElementById('conversation');
	var errorPara = document.createElement("P");
	errorPara.className = 'lexError';
	errorPara.appendChild(document.createTextNode(daText));
	conversationDiv.appendChild(errorPara);
	conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function showResponse(lexResponse) {

	var conversationDiv = document.getElementById('conversation');
	var responsePara = document.createElement("P");
	responsePara.className = 'lexResponse';
	if (lexResponse.message) {
		responsePara.appendChild(document.createTextNode(lexResponse.message + "\n" + lexResponse.intentName));
		responsePara.appendChild(document.createElement('br'));
	}

	conversationDiv.appendChild(responsePara);
	conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function get_dieases(){
	var disease_data = [];

	$.get("/get_disease", handle_data);
	function handle_data(data){
		for(var i = 0; i < data.length; i++){
			disease_data.push(data[i]);
		}
	}
	return disease_data;
}

function get_injury(){
	var injury_data = [];

	$.get("/get_injury", handle_data);
	function handle_data(data){
		for(var i = 0; i < data.length; i++){
			injury_data.push(data[i]);
		}
	}
	return injury_data;
}

function get_airline(){
	var airline_data = [];

	$.get("/get_airline", handle_data);
	function handle_data(data){
		for(var i = 0; i < data.length; i++){
			airline_data.push(data[i]);
		}
	}
	return airline_data
}

var dieases_data = get_dieases();
var injury_data = get_injury();
var airline_data = get_airline();

function submit_message(message) {

		var single_output = [];
		var single_injury = [];
		var injury_id;
		var injury_type;
		var injury_position;
		var identity;
		var date;
		var time;
		var from;
		var to;
		var seat;
		var dateFormat = 'YYYY-MM-DD';
		var timeFormat = 'HH:mm:ss';
		var down = document.getElementById('down');
		$.post( "/send_message", {message: message}, handle_response);

		function handle_response(data) {
				// append the bot repsonse to the div

				var new_output = data.message + "<br /> Detected Intent: " + data.intent;
				var lower_Intent = data.intent.toLowerCase();
				var split_output = data.message.split(",");


				// split the dialogResponse if it contains date and time.
				if(split_output[4] != undefined && split_output[4] != ''){
					date = moment(split_output[4].split('T')[0].trim(), dateFormat);
					if(date != undefined && date.isValid()) {
						from = split_output[1].trim();
						to = split_output[2].trim();
						seat = split_output[3].trim();
					}
				}

				// loop to get single disease_data
				for (var i = 0; i < dieases_data.length; i++){
					if (lower_Intent.includes(dieases_data[i]["disease"])){
						identity = dieases_data[i]["id"];
						single_output.push(dieases_data[i]);
						break;
					}
				}

				// loop to get single injury_data
				for (var j = 0; j < injury_data.length; j++){
					if(lower_Intent.includes(injury_data[j].type + " " + injury_data[j].position)){
						injury_id = injury_data[j].id;
						single_injury.push(injury_data[j]);
						break;
					}
				}

				// get injury_type and injury_position from the single injury output
				if(single_injury.length > 0){
					injury_type = single_injury[0].type;
					injury_position = single_injury[0].position;
				}

				// condotions to generate different output based on different intents
				// include "Doctor" in the intent
				if (data.intent.includes("-Doctor") == true){
					$.each(single_output, function(key, value){
						new_output = "Specialist: " + value.specialist + "<br /> Contact: " + value.contact +
						"<br /> Detected Intent: " + data.intent;
					});
				}
				// include "Medication" in the intent
				else if (data.intent.includes("-Medication") == true){
					$.each(single_output, function(key, value){
						new_output = "Medicine: " + value.medicine + "<br /> Detected Intent: " + data.intent;
					});
				}
				// include "Recommendation" in the intent
				else if(data.intent.includes("-Recommendation") == true){
					$.each(single_output, function(key, value){
						new_output = "Recommendation: " + value.recommendation + "<br /> Detected Intent: " + data.intent;
					});
				}
				//include "Cause" in the intent
				else if(data.intent.includes("-Cause") == true){
					$.each(single_output, function(key, value){
						new_output = "Cause: " + value.cause + "<br /> Detected Intent: " + data.intent;
					});
				}
				// include injury_type and injury_position in the intent
				else if (injury_type && injury_position != undefined || injury_type && injury_position != null){
					if(lower_Intent.includes(injury_type + " " + injury_position)) {
						$.each(single_injury, function(key, value){
							new_output = value.output + "<br /> Detected Intent: " + data.intent;
						});
					}
				}
				// to display the avaliable flights based on the input: from, to, seat, date, time.
				// for each loop has been used to search all match flights.
				else if( date != undefined){
					if(from != '' && to != '' && seat != '' && moment(date, dateFormat).isValid()){
						new_output = "Here is your search criteria: ";
						$.each(airline_data, function(key, value){
							if(value.depart == from.toLowerCase() && value.destination == to.toLowerCase()){

								var air_date = moment(value.date,'DD/MM/YY').format(dateFormat);

									if(moment(date).isSame(air_date)) {
										seat = seat.toLowerCase();
										if(seat == 'economy'){
											new_output += "<br/> Depart: " + value.depart + ", Destination: " + value.destination;
											new_output += ", Seat: economy, Date: " + value.date + ", Time: " + value.time;
											new_output += ", Price: " + value.economy + "<br/>";
											new_output += "Would you like to purchase the ticket? <br/>";

											return false;
										}else if(seat == 'business') {
											new_output += "<br/> Depart: " + value.depart + ", Destination: " + value.destination;
											new_output += ", Seat: business, Date: " + value.date + ", Time: " + value.time;
											new_output += ", Price: " + value.business + "<br/>";
											new_output += "Would you like to purchase the ticket? <br/>";

											return false;
										}else if(seat == 'first') {
											new_output += "<br/> Depart: " + value.depart + ", Destination: " + value.destination;
											new_output += ", Seat: first, Date: " + value.date + ", Time: " + value.time;
											new_output += ", Price: " + value.first + "<br/>";
											new_output += "Would you like to purchase the ticket? <br/>";

											return false;
										}
								}
							}
						});
					}
				}

				if (new_output == "Here is your search criteria: "){
					new_output = "Unfortunately, There is no flights on that time / date."
				}

				new_output.replace(/\n/g, "<br/>");
				$('.chat-container').append('<div class="chat-message bot-message">'
				+ new_output.replace(/\n/g, "<br/>") + '</div>')

				// remove the loading indicator
				$( "#loading" ).remove();
				down.scrollTop = down.scrollHeight;
		}
		down.scrollTop = down.scrollHeight;
	}

$(function(){

	$('#target').on('submit', function(e){
			e.preventDefault();
			const input_message = $('#input_message').val()
			// return if the user does not enter any text
			if (!input_message) {
					return
			}

			$('.chat-container').append(`
					<div class="chat-message human-message">
							${input_message}
					</div>
			`)

			// loading
			$('.chat-container').append(`
					<div class="chat-message text-center bot-message" id="loading">
							<b>...</b>
					</div>
			`)

			// clear the text input
			$('#input_message').val('')

			// send the message
			submit_message(input_message)
	});
});
