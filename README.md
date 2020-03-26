# Hands Down

Help slow the spread of COVID-19 by discouraging people from touching their face while sitting in front of a computer.

## Design

We break down the problem of inferring whether the subject is touching their face into 2 parts:
* We use FaceMesh and HandPose pretrained models to extract key points describing the geometry of the hand and the face.
* We train a neural network to predict, given the two sets of key points, whether the subject's hand is touching their face.

## Documentation

### Data Collection

One of the ways you can help the project is by collecting data to train our model. Note that we don't collect any personally identifiable data (like images); only the key points are collected. 

* First ensure you've gone through the development set up and have the app running locally.
* You will want to collect some positive data points (touching your face) by setting the Label button to True and negative ones (hand doing other things) by setting it to False.
* Assuming you're collecting positive data points, first ensure you're touching your face and then flip Collection to On. 
* Note that for as long as Collection is On, the app is collecting training data - so avoid lifting your hand from your face while the Label is True and touching your face while Label is False. A few mistakes are fine but sustained bad data will definitely confuse the model.
* Feel free to move your hand and face around to various configurations.
* Once finished (my suggestion is 5k data points for each label but feel free to wrap up earlier), click Export Data and upload it to our [Slack](https://app.slack.com/client/T010H9C0Q9F/browse-files). You can export all data together or in chunks. 
* And finally, nag Pedram to set up an automated TFX pipeline so that your upload kicks off a new training run :)

### Development

Clone the repo and run:

`npm install`

`npm start`

Then app should be serving at localhost:8080.
