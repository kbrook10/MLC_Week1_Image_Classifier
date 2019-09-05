// Define constant variable
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');


// Not exactly sure what this part does
let net;

// Create asynchronous function (e.g. actions are not sequential)
async function app() {
    console.log('Loading mobilenet..');

    // Load the model.
    net = await mobilenet.load();
    console.log('Sucessfully loaded model');
  

    await setupWebcam();

    // Read webcam image and associate with class
    const addExample = classId => {
        // Get the intermediate activation of MobileNet 'conv_preds' 
        // and pass that to the KNN classifier.
        const activation = net.infer(webcamElement, 'conv_preds');

        // Pass the intermediate activation to the classifier.
        classifier.addExample(activation, classId);
    };

    // When clicking a button, add an example for that class.
    document.getElementById('class-a').addEventListener('click', 
    	() => addExample(0));
    document.getElementById('class-b').addEventListener('click', 
    	() => addExample(1));
    document.getElementById('class-c').addEventListener('click', 
    	() => addExample(2));

    while (true) {
        // const result = await net.classify(webcamElement);

        // document.getElementById('console').innerText = `
        //     prediction: ${result[0].className}\n
        //     probability: ${result[0].probability}
        //     `;
        
        if (classifier.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(webcamElement, 'conv_preds');
        
        // Get the most likely class and confidences from the classifier module.
        const result = await classifier.predictClass(activation);

        const classes = ['A', 'B', 'C'];
        document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    // Give some breathing room by waiting for the next animation frame to
    // fire.
    await tf.nextFrame();
  }
}

// webcam setup function
async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || 
        navigatorAny.mediaDevicesGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

// Call app
app();


