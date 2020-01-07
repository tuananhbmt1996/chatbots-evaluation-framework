
		// Initialize the Amazon Cognito credentials provider
		AWS.config.region = 'us-east-1'; // Region
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		// Provide your Pool Id here
			IdentityPoolId: 'us-east-1:899aec37-549b-4c65-8697-bfc5d077353d',
		});
		var temp_selection = [];
		var medicEasy = [0,10];
		var medicMedium = [30,60];
		var medicComplex = [60,90];
		var flightEasy = [90,100];
		var flightMedium = [120,150];
		var flightComplex = [150,181];
		var totalQuestion = 0;
		var lex_index = 0;
		var dialog_index = 0;
		var lexruntime = new AWS.LexRuntime();
		var lexUserId = 'chatbot-demo' + Date.now();
		var sessionAttributes = {};
		var lex_results = [];
		var dialogflow_results = [];
		var isPause = false;
		var width = 1;
		var number = 0;
		function pushChatAuto(contents) {
			runLex(lex_index ,contents)
		}

		function runLex(index, contents)
		{
			var params = {
				botAlias: 'CHATEX',
				botName: 'SPA_Chatbot',
				inputText: contents[index].questions,
				userId: lexUserId,
				sessionAttributes: sessionAttributes
			};
			lexruntime.postText(params, function(err, data) {
					if (err) {
						console.log(err, err.stack);
						showError2('Error:  ' + err.message + ' (see console for details)', contents[index].id);
					}
					if (data) {
						// capture the sessionAttributes for the next cycle
						sessionAttributes = data.sessionAttributes;

						// show response and/or error/dialog status
						showResponse2(data, contents[index].id);
					}
					if(index < contents.length - 1)
					{
						index ++;
						runLex(index, contents);
					}

			});
		}

    //display error messages - Amazon
		function showError2(daText, selector_id) {
			$(".lexclass" + selector_id).after("<br />");

			var generateLexDiv = $("<div />");
			generateLexDiv.attr('id', "div-lex" + selector_id);
			generateLexDiv.attr('class', "col-12");
			generateLexDiv.css({"border": "1px solid black", "border-radius": "10px", "font-size": "15px"});
			generateLexDiv.html(daText);
			$(".lexclass" + selector_id).append(generateLexDiv);

		}

        //display response - Amazon
		function showResponse2(lexResponse, selector_id) {
			var generateLexDiv = $("<div />");
			generateLexDiv.attr('id', "div-lex" + selector_id);
			generateLexDiv.attr('class', "col-12");
			generateLexDiv.css({"margin":"4px", "font-size":"10px", "padding":"4px 10px 4px 10px","border-radius":"4px", "min-width":"50%", "max-width":"85%", "float":"right", "background-color":"#bbf"});
			generateLexDiv.html("Amazon Lex: " + lexResponse.message + "      intent: " + lexResponse.intentName);
			lex_results.push({"id": selector_id, "intents": lexResponse.intentName});

			$(".lexclass" + selector_id).after(generateLexDiv);

		}

        //evalution button
		$("#evaluation").click(function(){
			if($('input[type="checkbox"]:checked').length > 0)
			{
				totalQuestion = 0;
				width = 0.1;
				$("#myBar").width(width);
				get_question();
				$("#evaluation").hide();
            }else if($('input[type="checkbox"]:checked').length <= 0)
			{
				alert("Please select at least 1 level.");
            }
		});

    //generate metrics button
		$("#metrics").click(function(){
			getMetrics();
			$(".graph").show();
		});

    //reset button
		$("#resetEval").click(function(){
			temp_selection = [];
			lex_index = 0;
			dialog_index = 0;
			lex_results = [];
			dialogflow_results = [];
			isPause = false;
			width = 0.1;
			totalQuestion = 0;
			number = 0;
			$(".chat-container-1").empty();
			$(".chat-container-2").empty();
			$("#myBar").width(width);
			$("#resetEval").hide();
			$("#resetMetrics").hide();
			$("#evaluation").show();
			$("#metrics").hide();
			$("#mTable").hide();
			$(".eval").empty();
			$(".fligraph").hide();
			$(".medgraph").hide();
			$(".lexMedicEasy").hide();
      $(".diaMedicEasy").hide();
      $(".watsonMedicEasy").hide();
			$(".lexMedicMedium").hide();
      $(".diaMedicMedium").hide();
      $(".watsonMedicMedium").hide();
			$(".lexMedicComplex").hide();
      $(".diaMedicComplex").hide();
      $(".watsonMedicComplex").hide();
			$(".lexFlightEasy").hide();
      $(".diaFlightEasy").hide();
      $(".watsonFlightEasy").hide();
			$(".lexFlightMedium").hide();
      $(".diaFlightMedium").hide();
      $(".watsonFlightMedium").hide();
 			$(".lexFlightComplex").hide();
      $(".diaFlightComplex").hide();
      $(".watsonFlightComplex").hide();
  });

		// sending questions to both Dialogflow and Amazon Lex , and getting responses. Also, displaying
		// the questions and responses.
		function get_question(){
			isPause = true;
			var temp_array = [];
			async_callback("/get_question").done(

			function output(data){
				// selected domain
				var isMed = document.getElementById("medDomain").checked;
				var isFli = document.getElementById("fDomain").checked;

				// selected complexity
				var isBasic = document.getElementById("basic").checked;
				var isMedium = document.getElementById("medium").checked;
				var isComplex = document.getElementById("complex").checked;

				if(isMed)
				{
					if(isBasic)
					{
						for(var i = medicEasy[0]; i <= medicEasy[1]; i++){
							temp_array.push({"id": data[i].id, "questions": data[i].questions,
							"intentLex": data[i].intentLex, "intentDialog": data[i].intentDialog});
							totalQuestion += 1;
						}
						temp_selection.push("medicEasy");
					}
					if(isMedium)
					{
						for(var i = medicMedium[0]; i <= medicMedium[1]; i++){
							temp_array.push({"id": data[i].id, "questions": data[i].questions,
							"intentLex": data[i].intentLex, "intentDialog": data[i].intentDialog});
							totalQuestion += 1;
						}
						temp_selection.push("medicMedium");
					}
					if(isComplex)
					{
						for(var i = medicComplex[0]; i <= medicComplex[1]; i++){
							temp_array.push({"id": data[i].id, "questions": data[i].questions,
							"intentLex": data[i].intentLex, "intentDialog": data[i].intentDialog});
							totalQuestion += 1;
						}
						temp_selection.push("medicComplex");
					}
				}
				if (isFli)
				{
					if(isBasic)
					{
						for(var i = flightEasy[0]; i <= flightEasy[1]; i++){
							temp_array.push({"id": data[i].id, "questions": data[i].questions,
							"intentLex": data[i].intentLex, "intentDialog": data[i].intentDialog});
							totalQuestion += 1;
						}
						temp_selection.push("flightEasy");
					}
					if(isMedium)
					{
						for(var i = flightMedium[0]; i <= flightMedium[1]; i++){
							temp_array.push({"id": data[i].id, "questions": data[i].questions,
							"intentLex": data[i].intentLex, "intentDialog": data[i].intentDialog});
							totalQuestion += 1;
						}
						temp_selection.push("flightMedium");
					}
					if(isComplex)
					{
						for(var i = flightComplex[0]; i <= flightComplex[1]; i++){
							temp_array.push({"id": data[i].id, "questions": data[i].questions,
							"intentLex": data[i].intentLex, "intentDialog": data[i].intentDialog});
							totalQuestion += 1;
						}
						temp_selection.push("flightComplex");
					}
				}


				$.each(temp_array, function(key, value){
						questions = value.questions;

						var generateDiv1 = $("<div />");
						generateDiv1.attr('class', "lexclass"+value.id);
						generateDiv1.css({"margin":"4px", "font-size":"10px", "padding":"4px 10px 4px 10px","border-radius":"4px", "min-width":"50%", "max-width":"85%", "float":"left", "background-color":"#7d7"});
						generateDiv1.html(questions);

						var generateDiv2 = $("<div />");
						generateDiv2.attr('class', "diaclass"+value.id);
						generateDiv2.css({"margin":"4px", "font-size":"10px", "padding":"4px 10px 4px 10px","border-radius":"4px", "min-width":"50%", "max-width":"85%", "float":"left", "background-color":"#7d7"});
						generateDiv2.html(questions);

						$('.chat-container-1').append(generateDiv1);
						$('.chat-container-2').append(generateDiv2);

				});
				pushChatAuto(temp_array);
				pushToDialog(temp_array);
				isPause = false;
			})
		}


		// using async function to get data, but disable async.
		function async_callback(myURL){
				return $.ajax({
				url: myURL,
				dataType: "json",
				async: false,
			})
		}

		// callback the async function to do my business logic for getting dieases data.
		function get_dieases(){
			var disease_data = [];

			async_callback("/get_disease").done(
				function(data){
					for (var i = 0; i < data.length ; i++){
						disease_data.push(data[i]);
					}
				}
			)
			return disease_data;
		}

		// callback the async function to do my business logic for getting injury data.
		function get_injury(){
			var injury_data = [];

			async_callback("/get_injury").done(
				function(data){
					for(var i = 0; i < data.length; i++){
						injury_data.push(data[i]);
					}
				}
			)
			return injury_data;
		}

		function get_airline(){
			var airline_data = [];

			async_callback("/get_airline").done(
				function(data){
					for (var i = 0; i < data.length ; i++){
						airline_data.push(data[i]);
					}
				}
			)
			return airline_data
		}

		function pushToDialog(contents){
			sendToDialog(dialog_index, contents)
		}

		//send to dialogflow and get response
		function sendToDialog(index, contents) {

				$.post( "/send_message", {message: contents[index].questions}, handle_response);

				function handle_response(data) {

					showDialogResponse(data, contents[index].id);

					if( index < contents.length -1){
						index ++;
						sendToDialog(index, contents);
					}
				}
		}
		var dieases_data = get_dieases();
		var injury_data = get_injury();
		var airline_data = get_airline();

		function showDialogResponse(dialogResponse, selector_id){
			var progressBarStatus = false;
			var new_output = dialogResponse.message + "<br /> Detected Intent: " + dialogResponse.intent;
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
			var lower_Intent = dialogResponse.intent.toLowerCase();
			var split_output = dialogResponse.message.split(",");
			var dateFormat = 'YYYY-MM-DD';
			var timeFormat = 'HH:mm:ss';

			dialogflow_results.push({"id": selector_id, "intents": dialogResponse.intent});

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
			if (dialogResponse.intent.includes("-Doctor") == true){
				$.each(single_output, function(key, value){
					new_output = "Specialist: " + value.specialist + "<br /> Contact: " + value.contact +
					"<br /> Detected Intent: " + dialogResponse.intent;
				});
			}
			// include "Medication" in the intent
			else if (dialogResponse.intent.includes("-Medication") == true){
				$.each(single_output, function(key, value){
					new_output = "Medicine: " + value.medicine + "<br /> Detected Intent: " + dialogResponse.intent;
				});
			}
			// include "Recommendation" in the intent
			else if(dialogResponse.intent.includes("-Recommendation") == true){
				$.each(single_output, function(key, value){
					new_output = "Recommendation: " + value.recommendation + "<br /> Detected Intent: " + dialogResponse.intent;
				});
			}
            //include "Cause" in the intent
            else if(dialogResponse.intent.includes("-Cause") == true){
                $.each(single_output, function(key, value){
                    new_output = "Cause: " + value.cause + "<br /> Detected Intent: " + dialogResponse.intent;
                });
            }
			// include injury_type and injury_position in the intent
			else if (injury_type && injury_position != undefined || injury_type && injury_position != null){
				if(lower_Intent.includes(injury_type + " " + injury_position)) {
					$.each(single_injury, function(key, value){
						new_output = value.output + "<br /> Detected Intent: " + dialogResponse.intent;
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
										seat = '';
										to = '';
										from = '';
										return false;
									}else if(seat == 'business') {
										new_output += "<br/> Depart: " + value.depart + ", Destination: " + value.destination;
										new_output += ", Seat: business, Date: " + value.date + ", Time: " + value.time;
										new_output += ", Price: " + value.business + "<br/>";
										new_output += "Would you like to purchase the ticket? <br/>";
										seat = '';
										to = '';
										from = '';
										return false;
									}else if(seat == 'first') {
										new_output += "<br/> Depart: " + value.depart + ", Destination: " + value.destination;
										new_output += ", Seat: first, Date: " + value.date + ", Time: " + value.time;
										new_output += ", Price: " + value.first + "<br/>";
										new_output += "Would you like to purchase the ticket? <br/>";
										seat = '';
										to = '';
										from = '';
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
			// generate a div to display the msgs with a unique id
			// so that 1 question will have 2 answers there.
			var generateDiaDiv = $("<div />");
			generateDiaDiv.attr('id', "div-dialog" + selector_id);
			generateDiaDiv.attr('class', "col-12");
			generateDiaDiv.css({"margin":"4px", "font-size":"10px", "padding":"4px 10px 4px 10px","border-radius":"4px", "min-width":"50%", "max-width":"85%", "float":"right", "background-color":"#bbf"});
			generateDiaDiv.html("Dialogflow: " + new_output);
			$(".diaclass" + selector_id).after(generateDiaDiv);

			progressBarStatus = true;
			progressBarStatus = progressBarUpdate(progressBarStatus);
		}

		function getData(round){

            var temp_array_lex = [];
            var temp_array_dia = [];
            var temp_lex_results = [];
            var temp_dialogflow_results = [];

            async_callback("/get_question").done(
                function(data)
                {
                    if(round == 0 || round == 1 || round == 2)
                    {

                        if( temp_selection[round] == "medicEasy")
                        {
                            for(var i = medicEasy[0]; i < medicEasy[1]; i++){
                                temp_array_lex.push({"id": data[i].id,
                                                                 "intents": data[i].intentLex,
                                                                 "t": data[i].T,
                                                               "m" : data[i].M,
                                                                 "f" : data[i].F
                                                             });
                                temp_array_dia.push({"id": data[i].id,
                                                                          "intents": data[i].intentDialog,
                                                                          "t": data[i].T,
                                                                        "m" : data[i].M,
                                                                         "f" : data[i].F
                                                                      });
                            }
                            for(var ii = 0; ii < medicEasy[1] ; ii++)
                            {
                                temp_lex_results.push(lex_results[ii]);
                                temp_dialogflow_results.push(dialogflow_results[ii]);

                            }
                            number = number + (medicEasy[1]-medicEasy[0]);
                        } else if( temp_selection[round] == "medicMedium")
                        {
                            for(var i = medicMedium[0]; i < medicMedium[1]; i++){
                                temp_array_lex.push({"id": data[i].id,
                                                                 "intents": data[i].intentLex,
                                                                 "t": data[i].T,
                                                               "m" : data[i].M,
                                                                 "f" : data[i].F
                                                             });
                                temp_array_dia.push({"id": data[i].id,
                                                                          "intents": data[i].intentDialog,
                                                                          "t": data[i].T,
                                                                        "m" : data[i].M,
                                                                         "f" : data[i].F
                                                                      });
                            }
                            for(var ii = number ; ii < (medicMedium[1]-medicMedium[0]) + number ; ii++)
                            {
                                temp_lex_results.push(lex_results[ii]);
                                temp_dialogflow_results.push(dialogflow_results[ii]);

                            }
                            number = number + (medicMedium[1] - medicMedium[0]);
                        } else if( temp_selection[round] == "medicComplex")
                        {
                            for(var i = medicComplex[0]; i < medicComplex[1]; i++){
                                temp_array_lex.push({"id": data[i].id,
                                                                 "intents": data[i].intentLex,
                                                                 "t": data[i].T,
                                                               "m" : data[i].M,
                                                                 "f" : data[i].F
                                                             });
                                temp_array_dia.push({"id": data[i].id,
                                                                          "intents": data[i].intentDialog,
                                                                          "t": data[i].T,
                                                                        "m" : data[i].M,
                                                                         "f" : data[i].F
                                                                      });
                            }
                            for(var ii = number; ii < totalQuestion ; ii++)
                            {
                                temp_lex_results.push(lex_results[ii]);
                                temp_dialogflow_results.push(dialogflow_results[ii]);
                            }
                        }

                        if( temp_selection[round] == "flightEasy")
                        {
                            for(var i = flightEasy[0]; i < flightEasy[1]; i++){
                                temp_array_lex.push({"id": data[i].id,
                                                                 "intents": data[i].intentLex,
                                                                 "t": data[i].T,
                                                               "m" : data[i].M,
                                                                 "f" : data[i].F
                                                             });
                                temp_array_dia.push({"id": data[i].id,
                                                                          "intents": data[i].intentDialog,
                                                                          "t": data[i].T,
                                                                        "m" : data[i].M,
                                                                         "f" : data[i].F
                                                                      });
                            }
                            for(var ii = 0; ii < flightEasy[1] - flightEasy[0]; ii++)
                            {
                                temp_lex_results.push(lex_results[ii]);
                                temp_dialogflow_results.push(dialogflow_results[ii]);

                            }
                            number = number + (flightEasy[1]-flightEasy[0]);
                        } else if( temp_selection[round] == "flightMedium")
                        {
                            for(var i = flightMedium[0]; i < flightMedium[1]; i++){
                                temp_array_lex.push({"id": data[i].id,
                                                                 "intents": data[i].intentLex,
                                                                 "t": data[i].T,
                                                               "m" : data[i].M,
                                                                 "f" : data[i].F
                                                             });
                                temp_array_dia.push({"id": data[i].id,
                                                                          "intents": data[i].intentDialog,
                                                                          "t": data[i].T,
                                                                        "m" : data[i].M,
                                                                         "f" : data[i].F
                                                                      });
                            }
                            for(var ii = number ; ii < (flightMedium[1]-flightMedium[0]) + number ; ii++)
                            {
                                temp_lex_results.push(lex_results[ii]);
                                temp_dialogflow_results.push(dialogflow_results[ii]);

                            }
                            number = number + (flightMedium[1] - flightMedium[0]);
                        } else if( temp_selection[round] == "flightComplex")
                        {
                            for(var i = flightComplex[0]; i < flightComplex[1]; i++){
                                temp_array_lex.push({"id": data[i].id,
                                                                 "intents": data[i].intentLex,
                                                                 "t": data[i].T,
                                                               "m" : data[i].M,
                                                                 "f" : data[i].F
                                                             });
                                temp_array_dia.push({"id": data[i].id,
                                                                          "intents": data[i].intentDialog,
                                                                          "t": data[i].T,
                                                                        "m" : data[i].M,
                                                                         "f" : data[i].F
                                                                      });
                            }
                            for(var ii = number; ii < totalQuestion ; ii++)
                            {
                                temp_lex_results.push(lex_results[ii]);
                                temp_dialogflow_results.push(dialogflow_results[ii]);
                            }
                        }
                    }
                }
            )

			return {
				tempLex : temp_array_lex,
				tempDia : temp_array_dia,
				temp_lex_results: temp_lex_results,
				temp_dialogflow_results: temp_dialogflow_results
			};
		}

		function generateTrueMapping(results, expected_true_results){
			var tp = 0;
			var tn = 0;
			for(var i = 0 ; i < expected_true_results.length; i++)
			{
				if(expected_true_results[i].t == "1")
				{
					for(var ii = 0; ii < results.length; ii++)
					{
						if(expected_true_results[i].id == results[ii].id)
						{
                            if(results[ii].intents != null){

								if(expected_true_results[i].intents.toString() == results[ii].intents.toString())
								{
									tp += 1;
								}else {
									tn += 1;
								}
								break;
                            }
                        }
					}
				}
			}
			return {tp : tp, tn : tn};
		}

		function generateFalseMapping(results, expected_false_results){
			var fp = 0;
			var fn = 0;
			for(var i = 0 ; i < expected_false_results.length; i++)
			{
				if(expected_false_results[i].t == "0")
				{
					for(var ii = 0; ii < results.length; ii++)
					{
						if(expected_false_results[i].id == results[ii].id)
						{
                            if(results[ii].intents != null){

								if(expected_false_results[i].intents.toString() == results[ii].intents.toString())
								{
									fp ++;
								}else {
									fn ++;
								}
								break;
                            }
                        }
					}
				}
			}
			return {fp: fp, fn: fn};
		}

		function generateFallbackMapping(results, expected_fallback_results){
			var fb = 0;
			for(var i = 0 ; i < expected_fallback_results.length; i++)
			{
				if(expected_fallback_results[i].f == "0")
				{
					for(var ii = 0; ii < results.length; ii++)
					{
                        if(expected_fallback_results[i].id == results[ii].id)
                        {
                            if(results[ii].intents != null){

								if(results[ii].intents.toString() == "Fallback" || results[ii].intents.toString() == "Error handling")
								{
									fb +=1;
								}
								break;
                            }
						}
					}
				}
			}
			return fb;
		}

        function generateComprehensiveRate(results,expected_true_results)
            {
                var cpmRate = 0;
                var totalQuestion = 0;
                for(var i = 0 ; i < expected_true_results.length; i++)
                {
                    if(expected_true_results[i].m == "1")
                    {
                        totalQuestion += 1;
                        for(var ii = 0; ii < results.length; ii++)
                        {
                            if(expected_true_results[i].id == results[ii].id)
                            {
                                if(results[ii].intents != null){

                                    if(expected_true_results[i].intents.toString() == results[ii].intents.toString())
                                    {
                                        cpmRate += 1;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                return cpmRate/ totalQuestion;
        }



		function getMetrics()
		{
					for(var i = 0 ; i < temp_selection.length; i ++)
					{
							var data = getData(i);
              var temp_lex_expected_results = data.tempLex;
							var temp_dialogflow_expected_results = data.tempDia;
							var temp_lex_results = data.temp_lex_results;
							var temp_dialogflow_results = data.temp_dialogflow_results;

							var trueMappingLex = generateTrueMapping(temp_lex_results,temp_lex_expected_results);
							var tpLex = trueMappingLex.tp;
							var tnLex = trueMappingLex.tn;

							var trueMappingDia = generateTrueMapping(temp_dialogflow_results,temp_dialogflow_expected_results);
							var tpDia = trueMappingDia.tp;
							var tnDia = trueMappingDia.tn;

							var falseMappingLex = generateFalseMapping(temp_lex_results,temp_lex_expected_results);
							var fpLex = falseMappingLex.fp;
							var fnLex = falseMappingLex.fn;

							var falseMappingDia = generateFalseMapping(temp_dialogflow_results,temp_dialogflow_expected_results);
							var fpDia = falseMappingDia.fp;
							var fnDia = falseMappingDia.fn;

							var lexAIRate = generateAIrate(tpLex,tnLex,fpLex,fnLex);
            	var precisionLex = lexAIRate.precision;
							var recallLex = lexAIRate.recall;
							var general_accuracyLex = lexAIRate.general_accuracy;
							var f1_scoreLex = lexAIRate.f1_score;

							var diaAIRate = generateAIrate(tpDia,tnDia,fpDia,fnDia);
              var precisionDia = diaAIRate.precision;
							var recallDia = diaAIRate.recall;
							var general_accuracyDia= diaAIRate.general_accuracy;
							var f1_scoreDia = diaAIRate.f1_score;

							var fbLex = generateFallbackMapping(temp_lex_results,temp_lex_expected_results);
							var fbDia = generateFallbackMapping(temp_dialogflow_results,temp_dialogflow_expected_results);

							var cpmRateLex = generateComprehensiveRate(temp_lex_results,temp_lex_expected_results);
							var cpmRateDia = generateComprehensiveRate(temp_dialogflow_results,temp_dialogflow_expected_results);


							// Amazon Lex Metric Result
              $("#lex" + temp_selection[i] + "FBR").append(generateFallbackRate(fbLex, lex_results.length));
              $("#lex" + temp_selection[i] + "CpmRate").append(cpmRateLex);
              $("#lex" + temp_selection[i] + "Pre").append(precisionLex);
              $("#lex" + temp_selection[i] + "Rec").append(recallLex);
              $("#lex" + temp_selection[i] + "Gen").append(general_accuracyLex);
              $("#lex" + temp_selection[i] + "F1").append(f1_scoreLex);

              // Google Dialogflow Metric Result
              $("#dia" + temp_selection[i] + "FBR").append(generateFallbackRate(fbDia, dialogflow_results.length));
              $("#dia" + temp_selection[i] + "CpmRate").append(cpmRateDia);
              $("#dia" + temp_selection[i] + "Pre").append(precisionDia);
              $("#dia" + temp_selection[i] + "Rec").append(recallDia);
              $("#dia" + temp_selection[i] + "Gen").append(general_accuracyDia);
              $("#dia" + temp_selection[i] + "F1").append(f1_scoreDia);

							// selected domain
              var isMed = document.getElementById("medDomain").checked;
              var isFli = document.getElementById("fDomain").checked;

              // selected complexity
              var isBasic = document.getElementById("basic").checked;
              var isMedium = document.getElementById("medium").checked;
              var isComplex = document.getElementById("complex").checked;

							$("#mTable").show();
              $(".metricType").show();
              if(isMed)
              {
								$(".medgraph").show();
                  if(isBasic)
                  {
                      $(".lexMedicEasy").show();
                      $(".diaMedicEasy").show();
                      $(".watsonMedicEasy").show();
                  }
                  if(isMedium)
                  {
                      $(".lexMedicMedium").show();
                      $(".diaMedicMedium").show();
                      $(".watsonMedicMedium").show();
                  }
                  if(isComplex)
                  {
                      $(".lexMedicComplex").show();
                      $(".diaMedicComplex").show();
                      $(".watsonMedicComplex").show();
                  }
              } else if(isFli)
              {
								$(".fligraph").show();
                  if(isBasic)
                  {
                      $(".lexFlightEasy").show();
                      $(".diaFlightEasy").show();
                      $(".watsonFlightEasy").show();
                  }
                  if(isMedium)
                  {
                      $(".lexFlightMedium").show();
                      $(".diaFlightMedium").show();
                      $(".watsonFlightMedium").show();
                  }
                  if(isComplex)
                  {
                      $(".lexFlightComplex").show();
                      $(".diaFlightComplex").show();
                      $(".watsonFlightComplex").show();
                  }
              }

      }
		};

		function generateAIrate(tp,tn,fp,fn)
		{
			var precision = tp / (tp + fp);
			var recall = tp/ (tp + fn);
			var general_accuracy = (tp + tn)/(tp + tn + fp + fn);
			var f1_score = ((precision * recall) / (precision + recall)) * 2;
			return {
				precision: precision.toFixed(2),
				recall: recall.toFixed(2),
				general_accuracy: general_accuracy.toFixed(2),
				f1_score: f1_score.toFixed(2)
			};
		}

		function generateFallbackRate(fb, length){
			var fbRate = fb / length;
			return fbRate.toFixed(2);
		}

		function progressBarUpdate(update) {
	    var elem = document.getElementById("myBar");
	    var id = setInterval(frame, 200);
	    function frame() {
	      if (width >= 100) {
	        clearInterval(id);
					$("#metrics").show();
					$("#resetEval").show();
					$("#evaluation").show();
	      } else if (update == true){
	        width = width + (100/(totalQuestion));
					update = false;
	        elem.style.width = width + '%';
	      }
	    }
			return update;
	  }
