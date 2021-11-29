# Hands Down

![Master Build](https://github.com/misterpeddy/hands-down/workflows/Node.js%20CI/badge.svg)

Help slow the spread of COVID-19 by discouraging people from touching their face while sitting in front of a computer.

[Check it out here!](https://misterpeddy.github.io/hands-down/)

## Design

We break down the problem of inferring whether the subject is touching their face into 2 parts:

* We use FaceMesh and HandPose pre-trained models to extract key points describing the geometry of the hand and the face.
* We train a neural network to predict, given the two sets of key points, whether the subject's hand is touching their face.

## Documentation

### Data Collection

One of the ways you can help the project is by collecting data to train our model. Note that we don't collect any personally identifiable data (like images); only the key points are collected.

* First ensure you've gone through the development set up and have the app running locally.
* You will want to collect some positive data points (touching your face) by setting the Label button to True and negative ones (hand doing other things) by setting it to False.
* Assuming you're collecting positive data points, first ensure you're touching your face and then flip Collection to On.
* Note that for as long as Collection is On, the app is collecting training data - so avoid lifting your hand from your face while the Label is True and touching your face while Label is False. A few mistakes are fine, but sustained bad data will definitely confuse the model.
* Feel free to move your hand and face around to various configurations.
* Once finished (my suggestion is 5k data points for each label but feel free to wrap up earlier), click Export Data and upload it to our [Slack](https://app.slack.com/client/T010H9C0Q9F/browse-files). You can export all data together or in chunks.
* And finally, nag Pedram to set up an automated TFX pipeline so that your upload kicks off a new training run :)

### Development

Clone the repo and run:

1. `npm install`

2. `npm start` or `npm run dev` (like `npm start` but the server automatically restarts after any HTML/CSS/JS files are changed)

Then _app_ should be serving at localhost:1234.

### Pull Requests

Make sure you have branched off of the latest version of master. Keep commits short and PRs small for a short review process, and install `Tidy` if you don't already have it on your system. [Get HTML-Tidy](http://www.html-tidy.org/?target="blank)

[1]: http://www.html-tidy.org

There is a pre-commit hook that will check for good code style, and fail commits with an error. Run `npm run lint` to find out more.

Please check for Markdown linting issues if you're updating the `README.md` or any `Markdown`.

### Performance Metrics & Insights
We use Lighthouse for metrics and analysis.

#### Local testing
If you're locally testing the app and want to see how much the metrics change based on your changes, you should do the following:
1. Run the app on a separate (private) browser window (**before applying your changes**).
2. Launch Lighthouse (set on Desktop) by opening the DevTools (<kbd>CTRL/CMD</kbd>+<kbd>SHIFT</kbd>+<kbd>I</kbd>) then going on "Audits" (_with all categories enabled_) then click <kbd>Generate report</kbd>.
3. Take note of the result (you can also save it as HTML or JSON by clicking on <kbd>⋮</kbd>).
4. Apply your changes.
5. Reload the page (_if needed_).
6. Do step 2 and 3.

_Note_: you can run the app in your regular browser session, _but it's recommended_ to open a separate browser window with as few extensions as possible (since those can affect the performance score).

#### CI
The CI will test several metrics which are: performance, accessibility, best practices, SEO and _PWA_.
Each score (apart from the PWA ones) are percentage.

What are each metrics measuring?

**Performance**
- First Contentful Paint (FCP)
- Speed Index (SI)
- Time To Interactive (TTI)
- First Meaningful Paint (FMP)
- First CPU Idle
- Max Potential First Input Delay (MPFID)

**Accessibility**
- Contrast
- Accessible names
- Required and valid attributes
- ARIA labels and roles
- ...

**Best Practices**
- Use of HTTPS and HTTP/2
- No errors logged
- Safe CORS links
- HTML doctype
- ...

**Search Engine Optimization (SEO)**
- Mobile-friendliness
- Content Best Practices
- Descriptive metadata
- Successful HTTP status codes

**Progressive Web App (PWA)**
- Fast and reliable
- Installable
- PWA Optimized

If you want to export the results of the CI, you should do the following:
1. Click on the "Details" link beside the "Lighthouse / static-dist-dir (pull_request)" PR check.
2. Click on the "static-dist-dir" check below "Lighthouse".
3. You'll then see an "Artifacts (1)" button on the top right of the check window.
4. Click that button then click on the "lighthouse-results" link.