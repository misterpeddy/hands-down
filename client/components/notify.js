/*
  Notes:
  - This is for desktop notifications, to not be confused with Chrome extension notifications or Service workers notifications.
  - Best practices (https://docs.google.com/document/d/1WNPIS_2F0eyDm5SS2E6LZ_75tk6XtBSnR1xNjWJ_DPE) indicate it should Not be called
  on page load where there's no context, doing it at a logical point within the flow is preferable (that way, the user knows the context of the
    permission request).
  - It should also give room to the user to opt-out for the notifications (like in a cookie manager for instance), say in a notification settings page
  - This has no throttle/debounce ability built-in so if implemented like so it can spam you.
*/
const sound = require('../../public/assets/stop-it-get-some-help.mp3');

// TODO: Refactor into a thenable/awaitable function
function setupNotification(callback) {
  if (!('Notification' in window)) {
    // eslint-disable-next-line no-alert
    alert(
      'This browser does not support desktop notification! Please update your browser'
    );
  } else if (Notification.permission === 'granted') {
    callback();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
      if (permission === 'granted') {
        callback();
      }
    });
  } else {
    // eslint-disable-next-line no-alert
    alert(`The permission is ${Notification.permission}`);
  }
}

const AUDIO = new Audio();
AUDIO.onerror = ({ path }) => {
  // eslint-disable-next-line no-console
  console.warn(`The audio file used "${path[0].src}" doesn't exist!`);
};
AUDIO.onloadeddata = () => AUDIO.play();

// TODO Maybe add the possibility for the notification to increase the sound's volume every n notifications?
function playSound(fileName) {
  AUDIO.src = fileName;
}

/**
 * @param {string} notificationTitle Title
 * @param {{icon: string, body: string}} options Notification options
 */
function notify(notificationTitle, options = {}) {
  setupNotification(() => {
    const notification = new Notification(notificationTitle, options);
    playSound(sound);
    notification.onclick = () => AUDIO.pause();
  });
}

export default notify;
