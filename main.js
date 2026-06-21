// ============================================
//  adam iskandar — portfolio js
//  music player + nav + scroll animations
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- NAV: hamburger menu ----
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // ---- NAV: mark active page ----
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  // ---- SCROLL: fade-in animation ----
  var fadeEls = document.querySelectorAll('.fade-in');
  function checkFade() {
    fadeEls.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight - 50) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', checkFade);
  checkFade();


  // ================================================
  //  MUSIC PLAYER
  // ================================================

  // ---- playlist ----
  // add your mp3 files to the music/ folder and list them here
  var playlist = [
    { file: "music/Don't Stay.mp3", name: "don't stay"   },
    { file: 'music/Somewhere I Belong.mp3', name: 'somewhere i belong'  },
    { file: 'music/lying from you.mp3', name: 'lying from you'  },
    { file: 'music/Hit the Floor.mp3', name: 'hit the floor'  },
    { file: 'music/Easier to Run.mp3', name: 'easier to run'  },
    { file: 'music/Faint.mp3', name: 'faint'  },
    { file: 'music/Breaking the Habit.mp3', name: 'breaking the habit'  },
    { file: 'music/From the Inside.mp3', name: 'from the inside'  },
    { file: "music/Nobody's Listening.mp3", name: "nobody's listening"  },
    { file: 'music/Session.mp3', name: 'session'  },
    { file: 'music/Numb.mp3', name: 'numb'  },
  ];

  // restore music state from localStorage
  var savedState = JSON.parse(localStorage.getItem('playerState')) || {};
  var currentIndex = savedState.trackIndex || 0;
  var audio        = new Audio();
  var isPlaying    = false;

  // DOM references
  var vinyl        = document.getElementById('vinyl');
  var playBtn      = document.getElementById('play-btn');
  var prevBtn      = document.getElementById('prev-btn');
  var nextBtn      = document.getElementById('next-btn');
  var progressFill = document.getElementById('progress-fill');
  var progressBar  = document.getElementById('progress-bar');
  var currentTime  = document.getElementById('current-time');
  var totalTime    = document.getElementById('total-time');
  var volumeSlider = document.getElementById('volume-slider');
  var trackLabel   = document.getElementById('track-label');
  var statusLabel  = document.getElementById('player-status');
  var toggleBtn    = document.getElementById('player-toggle');
  var miniBtn      = document.getElementById('mini-btn');
  var playerEl     = document.getElementById('music-player');

  // ---- load a track by index ----
  // resumeTime: if provided, seek to this time once loaded (used on page load)
  // autoPlay: if true, start playing once ready (used on page load if it was playing)
  function loadTrack(index, resumeTime, autoPlay) {
    audio.src = playlist[index].file;
    if (trackLabel)   trackLabel.textContent  = playlist[index].name;
    if (progressFill) progressFill.style.width = '0%';
    if (currentTime)  currentTime.textContent = '0:00';
    if (totalTime)    totalTime.textContent   = '0:00';

    if (resumeTime || autoPlay) {
      if (statusLabel) statusLabel.textContent = 'loading...';

      audio.addEventListener('loadedmetadata', function onReady() {
        audio.removeEventListener('loadedmetadata', onReady);

        if (resumeTime) {
          audio.currentTime = resumeTime;
        }

        if (autoPlay) {
          audio.play().then(function () {
            isPlaying = true;
            if (vinyl)   vinyl.classList.add('spinning');
            if (playBtn) playBtn.textContent = '⏸';
            if (statusLabel) statusLabel.textContent = 'now playing';
          }).catch(function () {
            // browser blocked autoplay (needs a user interaction first)
            isPlaying = false;
            if (statusLabel) statusLabel.textContent = 'press ▶ to resume';
          });
        } else {
          if (statusLabel) statusLabel.textContent = 'press ▶ to play';
        }
      }, { once: true });
    } else {
      if (statusLabel) statusLabel.textContent = 'press ▶ to play';
    }
  }

  // load the saved track, resume position, and resume playback if it was playing
  loadTrack(currentIndex, savedState.currentTime, savedState.isPlaying);

  // ---- save player state to localStorage every 500ms ----
  function savePlayerState() {
    localStorage.setItem('playerState', JSON.stringify({
      trackIndex: currentIndex,
      currentTime: audio.currentTime,
      isPlaying: isPlaying
    }));
  }
  
  setInterval(savePlayerState, 500); // save every 500ms

  // ---- volume ----
  if (volumeSlider) {
    audio.volume = volumeSlider.value;
    volumeSlider.addEventListener('input', function () {
      audio.volume = this.value;
    });
  }

  // ---- play / pause ----
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      if (vinyl)      vinyl.classList.remove('spinning');
      if (playBtn)    playBtn.textContent = '▶';
      if (statusLabel) statusLabel.textContent = 'paused';
    } else {
      audio.play();
      isPlaying = true;
      if (vinyl)      vinyl.classList.add('spinning');
      if (playBtn)    playBtn.textContent = '⏸';
      if (statusLabel) statusLabel.textContent = 'now playing';
    }
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);

  // ---- prev button: go to previous track ----
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      var wasPlaying = isPlaying;
      isPlaying = false;
      if (vinyl)   vinyl.classList.remove('spinning');
      if (playBtn) playBtn.textContent = '▶';
      currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      loadTrack(currentIndex);
      if (wasPlaying) togglePlay();
    });
  }

  // ---- next button: go to next track ----
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var wasPlaying = isPlaying;
      isPlaying = false;
      if (vinyl)   vinyl.classList.remove('spinning');
      if (playBtn) playBtn.textContent = '▶';
      currentIndex = (currentIndex + 1) % playlist.length;
      loadTrack(currentIndex);
      if (wasPlaying) togglePlay();
    });
  }

  // ---- progress bar update ----
  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (currentTime)  currentTime.textContent = formatTime(audio.currentTime);
    if (totalTime)    totalTime.textContent   = formatTime(audio.duration);
  });

  // ---- click progress bar to seek ----
  if (progressBar) {
    progressBar.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressBar.getBoundingClientRect();
      var pct  = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  // ---- when track ends: auto-play next ----
  audio.addEventListener('ended', function () {
    isPlaying = false;
    if (vinyl)   vinyl.classList.remove('spinning');
    if (playBtn) playBtn.textContent = '▶';
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack(currentIndex);
    togglePlay(); // auto-play next track
  });

  // ---- collapse / expand player ----
  if (toggleBtn && playerEl) {
    toggleBtn.addEventListener('click', function () {
      playerEl.classList.toggle('collapsed');
      toggleBtn.textContent = playerEl.classList.contains('collapsed') ? '+' : '−';
    });
  }

  // mini-btn reopens
  if (miniBtn && playerEl) {
    miniBtn.addEventListener('click', function () {
      playerEl.classList.remove('collapsed');
      if (toggleBtn) toggleBtn.textContent = '−';
    });
  }

  // ---- helper: format seconds → m:ss ----
  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

});