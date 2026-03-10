(function(global){
  function openModal(modal){
    if(!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function bindModal(modal){
    if(!modal) return;
    modal.addEventListener('click', (event) => {
      if(event.target === modal) closeModal(modal);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal));
    });
  }

  function createConfirmModal(modal, confirmBtn){
    let onConfirm = null;
    confirmBtn.addEventListener('click', () => {
      if(typeof onConfirm === 'function') onConfirm();
      closeModal(modal);
      onConfirm = null;
    });

    return {
      open(callback){
        onConfirm = callback;
        openModal(modal);
      },
      close(){
        closeModal(modal);
        onConfirm = null;
      }
    };
  }

  global.UI = {
    openModal,
    closeModal,
    bindModal,
    createConfirmModal
  };
})(window);
