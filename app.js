
function goView(v, push = true) {

  if (push && currentView !== v) {
    viewStack.push(v);
  }

  currentView = v;

  $$('.app-view').forEach(el => {
    el.classList.remove('active');
  });

  const view = document.getElementById('view-' + v);

  if (view) {
    view.classList.add('active');
  }

  $$('.bottom-nav button[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === v);
  });

  render();

  setTimeout(() => {

    const target = document.getElementById('view-' + v);

    if (target) {

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        15;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });

    }

  }, 100);
}

function goHome() {

  currentView = 'groups';

  $$('.app-view').forEach(el => {
    el.classList.remove('active');
  });

  const view = document.getElementById('view-groups');

  if (view) {
    view.classList.add('active');
  }

  render();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
