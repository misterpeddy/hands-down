import main from './main';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../public/service-worker.js');
  });
}

main();
