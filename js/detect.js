detect = function () {
  //private menbers
  let forwardTimes = []
  let withBoxes = false
  var isVidoe = false;

  //private methods
  function init() {
    console.log('detect is loaded.');

  }

  //////////////////////////////////
  //FaceDetector
  
  async function initFaceDetector() {
    // load face detection and face expression recognition models
    await changeFaceDetector(TINY_FACE_DETECTOR)            //選擇FaceDetector演算法 //注意路徑**
    await faceapi.loadFaceLandmarkModel('face-api/')        //加載FaceLandmarkModel //注意路徑**
    // await faceapi.loadFaceExpressionModel('face-api/')   //加載FaceExpressionModel //注意路徑**
    changeInputSize(224)

    // try to access users webcam and stream the images
    // to the video element
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    const videoEl = $('#inputVideo').get(0)
    videoEl.srcObject = stream
  }

  function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
    $('#time').val(`${Math.round(avgTimeInMs)} ms`)
    $('#fps').val(`${faceapi.utils.round(1000 / avgTimeInMs)}`)
  }

  async function onPlay() {

    // console.log('play');

    const videoEl = $('#inputVideo').get(0)

    if ($('#inputVideo').height() != 0 && !isVidoe) {
      isVidoe = true;
      console.log($('#inputVideo').height());
      var _d = ($(window).height() * 1.3) / $('#inputVideo').height();
      gsap.set('.video__container', { x: -30, scaleX: -_d, scaleY: _d, transformOrigin: 'center top' });
    }

    if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
      return setTimeout(() => onPlay())


    const options = getFaceDetectorOptions()
    const ts = Date.now()
    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks()
    var _faceLandmarks;

    updateTimeStats(Date.now() - ts)

    if (result) {
      const canvas = $('#overlay').get(0)
      const dims = faceapi.matchDimensions(canvas, videoEl, true)

      const resizedResult = faceapi.resizeResults(result, dims)
      const minConfidence = 0.05
      if (withBoxes) {
        faceapi.draw.drawDetections(canvas, resizedResult)
      }
      // faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
      faceapi.draw.drawFaceLandmarks(canvas, resizedResult)

      _faceLandmarks = resizedResult.landmarks;
      console.log(_faceLandmarks);
    }

    //FaceExpressions
    // const result2 = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()
    // console.log(result2);
    // if(result2 !== 'undefined') console.log(result2);     
    // if (result2) {
    //   const canvas = $('#overlay').get(0)
    //   const dims = faceapi.matchDimensions(canvas, videoEl, true)

    //   const resizedResult2 = faceapi.resizeResults(result2, dims)
    //   const minConfidence = 0.05
    //   faceapi.draw.drawFaceExpressions(canvas, resizedResult2, minConfidence) 
    // }

    setTimeout(() => onPlay())
  }

  //////////////////////////////////

  function intoPage(el, status = "block") {
    gsap.fromTo(el, {
      autoAlpha: 0,
      display: status
    }, {
      duration: 1.3,
      autoAlpha: 1,
      ease: "power2.out",
      delay: 0.3
    })
  }

  function leavePage(el) {
    gsap.fromTo(el, {
      autoAlpha: 1
    }, {
      duration: 0.3,
      autoAlpha: 0,
      onComplete: function () {
        $(el).css("display", "none");
      }
    })
  }

  {
    $(document).ready(function () {

      intoPage(".frame03");
      initFaceDetector();
    });
  }

  //public
  return {
    intoPage: function () {
      intoPage();
    },
    leavePage: function () {
      leavePage();
    },

    nextPage: function () {
      nextPage();
    },

    onPlay:function () {
      onPlay();
    }
  };
};

var detect = new detect();