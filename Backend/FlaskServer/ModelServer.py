#!/usr/bin/python
import json
import urllib.request
from flask import Flask
from flask import request
from fastai.vision import *
from fastai.vision import open_image
from flask import jsonify
import base64
from flask_cors import CORS


# Saving the working directory and model directory
cwd = os.getcwd()
path = cwd + '/model'

# Initializing the FLASK API
app = Flask(__name__)
CORS(app)
# app.debug = True


# Loading the saved model using fastai's load_learner method
learner = load_learner(path, "export.pkl")
classes = learner.data.classes


def top_3_preds(preds):
    preds_s = preds.argsort(descending=True)
    preds_s = preds_s[:3]
    return preds_s


def top_3_pred_labels(preds, classes):
    top_3 = top_3_preds(preds)
    labels = []
    confidence = []
    for i in top_3:
        x = classes[i]
        p = preds[i]
        labels.append(x)
        confidence.append(p)
    return labels


@app.before_request
def log_request_info():
    app.logger.error('Headers: %s', request.headers)
    app.logger.error('Body: %s', request.get_data())


@app.route('/_model2', methods=['POST'])
# Defining the predict method get input from the html page and to predict using the trained model
def hello_model():
    defaults.device = torch.device('cpu')
    data = request.data
    print(data)
    with open("imageToSave.jpg", "wb") as fh:
        fh.write(base64.decodebytes(img_data))
    img = open_image(imageToSave.jpg)
    preds, tensor, probs = learner.predict(img)
    return jsonify({
        "predictions": top_3_pred_labels(probs, classes)
    })


@app.route('/', methods=['GET'])
# Defining the predict method get input from the html page and to predict using the trained model
def hello():
    return 'Hello World\n'


# Writing api for inference using the loaded model
@app.route('/_predict', methods=['POST'])
# Defining the predict method get input from the html page and to predict using the trained model
def classify_url():
    defaults.device = torch.device('cpu')
    img = open_image(request.files["file"])
    preds, tensor, probs = learner.predict(img)
    return jsonify({
        "predictions": top_3_pred_labels(probs, classes)
    })


if __name__ == "__main__":
    app.run(host='127.0.0.1')

