const BODY = document.querySelector('body');

// /**
//  * detecting device
//  */
if (/iPhone/i.test(navigator.userAgent)) {
  console.log('✅');
} else {
  BODY.classList.add('hidden');
  console.log('❌');
}


/**
 * to check the country of the user
 */
const MAIN = document.querySelector('main');
const VPN_SCREEN = document.getElementById('need_vpn_screen_sec');
MAIN.classList.add('hidden');
fetch('https://ipinfo.io/json')
.then((res) => {
  VPN_SCREEN.classList.add('hidden');
  MAIN.classList.remove('hidden');
})
.catch((error) => {
  VPN_SCREEN.classList.remove('hidden');
  VPN_SCREEN.classList.add('flex');
  console.error('An error occurred with ipinfo:', error);
});


/**
 * background audio
 */
var audio = document.getElementById("audio");
const PLAY_PAUSE_IMG = document.getElementById('play_pause');

function togglePlayPause() {
  if (audio.paused) {
      audio.play();
      PLAY_PAUSE_IMG.src = '../public/img/play.png';
  } else {
      audio.pause();
      PLAY_PAUSE_IMG.src = '../public/img/pause.png';
  }
}


const CURRENT_IMG = document.getElementById('current_img')


// notification location
alertify.set('notifier','position', 'bottom-left');
  


/**
 * connecting, sending and reveicing img urls from the database
 */
const app = new Realm.App({ id: 'application-0-ysfda' });
const email = 'unixnexo@gmail.com';
const password = 'asfdjlKJFSLKDoi032rujfo';
const databaseName = 'sexyHot';
const collectionName = 'motherFuckers';
let array_imgs = [];

// to log in
function logIn(email, password) {
  return app.logIn(Realm.Credentials.emailPassword(email, password));
}

// to log out
function logOut() {
  return app.currentUser.logOut();
}

// to retrieve image URLs from the database
function retrieveImageURLs(email, password, databaseName, collectionName) {
  return logIn(email, password)
    .then((user) => {
      const mongodb = app.currentUser.mongoClient('mongodb-atlas');
      const database = mongodb.db(databaseName);
      const collection = database.collection(collectionName);
      return collection.find({});
    })
    .then((documents) => {
      array_imgs = documents.map((document) => document.url).reverse();
      console.log('Image URLs retrieved successfully:', array_imgs);
    })
    .catch((error) => {
      alertify.error('Error retrieving documents. code: 209348');
    })
    .finally(() => logOut());
}

// to log in and insert a document into the database
function logInAndInsertDocument(email, password, databaseName, collectionName, documentToInsert) {
  return app.logIn(Realm.Credentials.emailPassword(email, password))
    .then((user) => {
      const mongodb = app.currentUser.mongoClient('mongodb-atlas');
      const database = mongodb.db(databaseName);
      const collection = database.collection(collectionName);

      return collection.insertOne(documentToInsert);
    })
    .then((result) => {
      console.log(`Document inserted with ID: ${result.insertedId}`);
    })
    .catch((error) => {
      alertify.error('Error logging in or inserting document. code: 82743');
    })
    .finally(() => logOut());
}


// to upload an image into the host service
const BTN_SUBMIT = document.getElementById('btn_submit');
function uploadImage() {
  const UPLOAD_STATE_TEXT = document.getElementById('uploading_state_status_text');
  const DONE_STATE_TEXT = document.getElementById('done_state_status_text');
  const ERROR_STATE_TEXT = document.getElementById('error_state_status_text');

  const input = document.getElementById('file_input');
  const file = input.files[0];

  if (file) {
    UPLOAD_STATE_TEXT.classList.remove('hidden');
    BTN_SUBMIT.disabled = true;

    const formData = new FormData();
    formData.append('image', file);

    fetch('https://api.imgbb.com/1/upload?key=a5caa03a4cb8277407ed0318e133b108', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Insert into database
      const documentToInsert = {
        url: data.data.url,
      };
      return logInAndInsertDocument(email, password, databaseName, collectionName, documentToInsert);
    })
    .then(() => {
        // Refresh array_imgs by retrieving the latest data from the database
        return retrieveImageURLs(email, password, databaseName, collectionName);
    })
    .then(() => {
        // to update the index of the pics at the bottom of the imgs
        index_of_pics();
        
        UPLOAD_STATE_TEXT.classList.add('hidden');
        DONE_STATE_TEXT.classList.remove('hidden');
        input.value = '';
        BTN_SUBMIT.disabled = false;
    
        return new Promise((resolve) => {
            setTimeout(() => {
                DONE_STATE_TEXT.classList.add('hidden');
                resolve(); 
            }, 3000);
        });
    })
    .then(() => {
        CURRENT_IMG.src = array_imgs[0];
        alertify.success('img has been uploaded.');
    })
    .catch(error => {
        UPLOAD_STATE_TEXT.classList.add('hidden');
        ERROR_STATE_TEXT.classList.remove('hidden');
        setTimeout(() => {
          ERROR_STATE_TEXT.classList.add('hidden');
        }, 4000);
        alertify.error('Error uploading the img. code: 4920');
    });
  } else {
        alertify.error('select an image mother fucker!');
  }
}


const IMG_SECTION = document.getElementById('img-section');
const INDEX_IMG_SECTION = document.getElementById('index_of_img_section');
const AWAIT_TEXT = document.getElementById('await_text');
IMG_SECTION.classList.add('hidden');
INDEX_IMG_SECTION.classList.add('hidden');
// Call the function to retrieve documents and populate the array_imgs array when the page loads
window.onload = () => {
    retrieveImageURLs(email, password, databaseName, collectionName)
    .then(() => {
        CURRENT_IMG.src = array_imgs[0];
        // CURRENT_IMG.src = array_imgs[array_imgs.length - 1];
        index_of_pics();

        IMG_SECTION.classList.remove('hidden');
        INDEX_IMG_SECTION.classList.remove('hidden');
        AWAIT_TEXT.classList.add('hidden');
  })
  .catch((error) => {
      alertify.error('Error retrieving image URLs, reload the page. code: 720181');
  });

};



/**
 * to go to the next or previous img
 */
let currentIndex = 0;
function nextImg(event) {
    const clickX = event.clientX;
    const imgWidth = CURRENT_IMG.offsetWidth;

    if (clickX < imgWidth / 2) {
        // Clicked on the left side
        currentIndex = (currentIndex - 1 + array_imgs.length) % array_imgs.length;
    } else {
        // Clicked on the right side
        currentIndex = (currentIndex + 1) % array_imgs.length;
    }

    CURRENT_IMG.src = array_imgs[currentIndex];

    index_of_pics();

}


/**
 * the number index below the pics
 */
function index_of_pics() {
    document.getElementById('current_index').innerHTML = currentIndex + 1;
    document.getElementById('whole_index').innerHTML = array_imgs.length;
}

document.addEventListener('DOMContentLoaded', index_of_pics);


/**
 * hammer.js | for touch actions in mobile phones
 */
const THREE_DOT_CON = document.getElementById('3-dot-con');     
const THREE_DOT = document.querySelectorAll('.three_dots');
const MENU_OVERLAY = document.getElementById('menu_overlay');

const hammer = new Hammer(THREE_DOT_CON);
hammer.on('tap', function(e) {

    // 3 dot animation
    THREE_DOT.forEach((dot, index) => {
        dot.style.animation = 'none';
        void dot.offsetWidth; // Trigger a reflow (important for restarting the animation)
        dot.style.animation = `pupit 1s ${index * 0.1}s`; 
    });

    // to open/close the menu 
    if (MENU_OVERLAY.style.display === 'none') {
        MENU_OVERLAY.style.opacity = '1';
        setTimeout(() => {
            MENU_OVERLAY.style.display = 'block';
        }, 500);
    } else if (MENU_OVERLAY.style.display === 'block') {
        MENU_OVERLAY.style.opacity = '0';
        setTimeout(() => {
            MENU_OVERLAY.style.display = 'none';
        }, 500);
    }
});

// to close the menu when touched the img sec
IMG_SECTION.addEventListener('touchstart', () => {
    if (MENU_OVERLAY.style.display === 'block') {
        MENU_OVERLAY.style.opacity = '0';
        setTimeout(() => {
            MENU_OVERLAY.style.display = 'none';
        }, 500);
    }  
})


// animation ofr file input btn for submiting a img
const hammer1 = new Hammer(BTN_SUBMIT);
hammer1.on('tap', function(e) {
    BTN_SUBMIT.style.transform = 'scale(0.9)';
    setTimeout(() => {
        BTN_SUBMIT.style.transform = 'scale(1)';
    }, 200);
})


