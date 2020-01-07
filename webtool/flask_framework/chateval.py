from flask import Flask, render_template, url_for, request, jsonify
from pydialogflow_fulfillment import DialogflowRequest
import requests
import dialogflow_v2 as dialogflow
import csv
import os
import io
import pusher


app = Flask(__name__)


@app.route('/')

@app.route('/chatbots')
def chatbots():
    return render_template('chatbots.html')


@app.route('/evaluation')
def evaluation():
    return render_template('evaluation.html')


@app.route('/documentation')
def documentation():
    return render_template('documentation.html')


# Copyright 2017 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)

    if text:
        text_input = dialogflow.types.TextInput(
            text=text, language_code=language_code)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(
            session=session, query_input=query_input)

        return response.query_result.fulfillment_text


def detect_intent(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)

    if text:
        text_input = dialogflow.types.TextInput(
            text=text, language_code=language_code)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(
            session=session, query_input=query_input)

        return response.query_result.intent.display_name


def detect_intent_parameters(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)

    if text:
        text_input = dialogflow.types.TextInput(
            text=text, language_code=language_code)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(
            session=session, query_input=query_input)

        return response.query_result.parameters

 ###################### End here #########################################

@app.route('/get_injury', methods=['GET'])
def get_injury():
    results = []
    with open('injury.csv', encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            results.append(row)

    return jsonify(results)

# csv file need to be edited
@app.route('/get_disease', methods=['GET'])
def get_disease():
    results = []
    with open('disease.csv', encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            results.append(row)

    return jsonify(results)

# csv file need to be edited
@app.route('/get_airline', methods=['GET'])
def get_airline():
    results = []
    with open('airline.csv', encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            results.append(row)

    return jsonify(results)


@app.route('/get_question', methods=['GET'])
def get_question():
    results = []
    with open('metricstest.csv', encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            results.append(row)
    return jsonify(results)


@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    fulfillment_text = detect_intent_texts(project_id, "unique", message, 'en')
    intent_text = detect_intent(project_id, "unique", message, 'en')

    response_text = {"message": fulfillment_text, "intent": intent_text}

    return jsonify(response_text)


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
