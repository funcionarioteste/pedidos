(function(global){
  const root = document.documentElement;

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    Storage.setTheme(theme);
  }

  function toggleTheme(){
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function init(toggleButton){
    const stored = Storage.getTheme() || 'light';
    root.setAttribute('data-theme', stored);
    if(toggleButton){
      toggleButton.addEventListener('click', toggleTheme);
    }
  }

  global.Theme = { init, applyTheme, toggleTheme };
})(window);
