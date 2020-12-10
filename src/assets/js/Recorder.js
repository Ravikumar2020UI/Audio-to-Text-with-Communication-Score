// Initialize recorder
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
}
var noteContent = '';
/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    $('#audio-textarea').val(noteContent);            
  }
};

recognition.onstart = function() { 
  console.log('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  console.log('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    console.log('No speech was detected. Try again.');  
  };
}

var constraints = { audio: true, video:false }
var recorder;
var rec;
var audioChunks = [];
var recording = false;
var recorderBlob;
var gumStream;
var base64AudioFormat;
var communicationscore;
function triggerRecordButton(){    
    var recordButton = document.getElementById("recordButton");    
    recordButton.addEventListener("click", function () {
      if (recording) {
        recognition.stop();       
        stopRecording();
        recordButton.innerHTML = "Record";
      }
      else {
        $('#audio-textarea').val('');
        noteContent = '';
        startRecording();        
        recognition.start();
        recordButton.innerHTML = "Stop"; 
       }
    });    
}
function convertToBase64(blob){
  // encode base64
  var reader = new FileReader();
  reader.readAsDataURL(blob); 
  reader.onloadend = function() {
      base64data = reader.result.split(',')[1];
      base64AudioFormat=base64data;       
  }
  // 
}
function startRecording() {  
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1;  
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      /* create an audio context after getUserMedia is called */
      var audioContext = new AudioContext(); 
      //assign to gumStream for later use
      gumStream = stream;
      var input = audioContext.createMediaStreamSource(stream);
      var analyser = audioContext.createAnalyser();
      input.connect(analyser);
      //get the encoding 
      var encodingType = "wav";
      if (!isSafari) {         
        recorder = new WebAudioRecorder(input, {
          workerDir: "/", // must end with slash
          encoding: encodingType,
          numChannels:2, //2 is the default, mp3 encoding supports only 2
          onEncoderLoading: function(recorder, encoding) {
            // show "loading encoder..." display
            console.log("Loading "+encoding+" encoder...");
            },
            onEncoderLoaded: function(recorder, encoding) {
            // hide "loading encoder..." display
            console.log(encoding+" encoder loaded");
            }
        });
        recorder.onComplete = function(recorder, blob) { 
          console.log("Encoding complete");
          convertToBase64(blob);
          recorderBlob = blob;
          console.log("Blob", recorderBlob);
          setTimeout(function(){  
            fdata = new FormData();
            var audiotext = $('#audio-textarea').val();
            fdata.append( 'category',audiotext);
            fdata.append( 'file',recorderBlob);
            fdata.append( 'language_id','en-GB');
            fdata.append( 'user_token','demo');
            $.ajax({
              url: 'https://api.soapboxlabs.com/v1/speech/verification',
              data: fdata,
              processData: false,
              contentType: false,
              type: 'POST',
              headers: {
                  'x-app-key':'cd2d306a-098d-11eb-872a-8ea592eae0a2',
                  'accept':'*/*'
              },            
              success: function(data){
                console.log('Score',data);
                communicationscore = data;
                $('#audio-communication-result').val(JSON.stringify(data));  
              }
            });
          }, 1000);                  
        }
        //start the recording process
        recorder.startRecording();
      }
      else{
        rec = new MediaRecorder(stream);
        rec.ondataavailable = function(e) {
          audioChunks.push(e.data);
          if (recording == false) {
            var blob = new Blob(this.audioChunks);
            recorderBlob = blob;
            console.log("recorderBlob",blob);
          }
        };
        rec.start();
      }
      console.log("Recording started");
      recording = true;
    });
}
function getCommunicationScore(){
  return communicationscore;
}
function stopRecording() {
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1;                  
    gumStream.getAudioTracks()[0].stop();
    if (!isSafari) {
      recorder.finishRecording();
    }
    else {
      rec.stop();
    }     
    recording = false;
}