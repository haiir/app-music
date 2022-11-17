const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 *        1. render song  -----> done
 *        2. scroll top   -----> done
 *        3. play/pause/seek  -----> done
 *        4. CD rotate    -----> done
 *        5. next/prev    -----> done
 *        6. random       -----> done
 *        7. auto next / repeat when ended -----> done
 *        8. active song          -----> done
 *        9. scroll active song when into view
 *        10. play song when click
 *
 **/
// bien dung chung.
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const player = $(".player");
const progress = $("#progress");
const btnPlay = $(".btn.btn-toggle-play");
const btnPrev = $(".btn.btn-prev");
const btnNext = $(".btn.btn-next");
const btnRandom = $(".btn.btn-random");
const btnRepeat = $(".btn.btn-repeat");
const playlist = $(".playlist");

const SETTING_USER = "SETTING_USER";
const app = {
  songs: [
    { name: "name 1", singer: "singer 1", path: "./assets/music/1.mp3", image: "./assets/image/1.jpg" },
    { name: "name 2", singer: "singer 2", path: "./assets/music/2.mp3", image: "./assets/image/2.jpg" },
    { name: "name 3", singer: "singer 3", path: "./assets/music/3.mp3", image: "./assets/image/3.jpg" },
    { name: "name 4", singer: "singer 4", path: "./assets/music/4.mp3", image: "./assets/image/4.jpg" },
    { name: "name 1", singer: "singer 1", path: "./assets/music/1.mp3", image: "./assets/image/1.jpg" },
    { name: "name 2", singer: "singer 2", path: "./assets/music/2.mp3", image: "./assets/image/2.jpg" },
    { name: "name 3", singer: "singer 3", path: "./assets/music/3.mp3", image: "./assets/image/3.jpg" },
    { name: "name 4", singer: "singer 4", path: "./assets/music/4.mp3", image: "./assets/image/4.jpg" },
    { name: "name 1", singer: "singer 1", path: "./assets/music/1.mp3", image: "./assets/image/1.jpg" },
    { name: "name 2", singer: "singer 2", path: "./assets/music/2.mp3", image: "./assets/image/2.jpg" },
    { name: "name 3", singer: "singer 3", path: "./assets/music/3.mp3", image: "./assets/image/3.jpg" },
    { name: "name 4", singer: "singer 4", path: "./assets/music/4.mp3", image: "./assets/image/4.jpg" },
  ],
  currentIndex: 0,
  isPlay: false,
  cdThumbAnimate: cdThumb.animate(
    {
      transform: "rotate(360deg)",
    },
    {
      duration: 10000,
      interations: Infinity,
    },
  ),
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(SETTING_USER)) || {},

  // save setting user
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(SETTING_USER, JSON.stringify(this.config));
  },

  loadConfig() {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    // show state initinal
    btnRandom.classList.toggle("active", this.isRandom);
    btnRepeat.classList.toggle("active", this.isRepeat);
  },

  // method contains all event for app
  handleEvent() {
    // event scroll top
    const cd = $(".cd");
    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
      const scrollTop = document.documentElement.scrollTop || window.scrollX;
      const newCdWidth = scrollTop <= cdWidth ? cdWidth - scrollTop : 0;
      cd.style.width = newCdWidth + "px";
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // event click btn play
    btnPlay.onclick = () => {
      if (!this.isPlay) audio.play();
      else audio.pause();
    };

    // event play and pause cua element audio. su kien xay ra khi call method method method play() va pause()
    audio.onplay = () => {
      this.isPlay = true;
      player.classList.add("playing");
      this.cdThumbAnimate.play();
    };

    audio.onpause = () => {
      this.isPlay = false;
      player.classList.remove("playing");
      this.cdThumbAnimate.pause();
    };

    // event audio play
    audio.ontimeupdate = function () {
      let progressPercent = 0;
      // currentTime return second current con duration la length second for song
      if ((audio.currentTime / audio.duration) * 100) progressPercent = Math.round((audio.currentTime / audio.duration) * 100);
      progress.value = progressPercent;
    };

    // event rewind progress
    progress.onchange = function () {
      const seekTime = (this.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };

    // event next an previous
    btnNext.onclick = () => {
      audio.pause();
      if (!this.isRandom) {
        if (++this.currentIndex >= this.songs.length) this.currentIndex = 0;
      } else this.currentIndex = this.randomIndex();
      this.loadSong();
      this.render();
      audio.play();
      this.scrollToSong();
    };
    btnPrev.onclick = () => {
      audio.pause();
      if (!this.isRandom) {
        if (--this.currentIndex <= -1) this.currentIndex = this.songs.length - 1;
      } else this.currentIndex = this.randomIndex();
      this.loadSong();
      this.render();
      audio.play();
      this.scrollToSong();
    };

    // event random song
    btnRandom.onclick = () => {
      this.isRandom = !this.isRandom;
      btnRandom.classList.toggle("active");
      this.setConfig("isRandom", this.isRandom);
    };

    // event when song ended
    audio.onended = () => {
      if (this.isRepeat) audio.play();
      else btnNext.click();
    };

    // event repeat song
    btnRepeat.onclick = () => {
      this.isRepeat = !this.isRepeat;
      btnRepeat.classList.toggle("active");
      this.setConfig("isRepeat", this.isRepeat);
    };

    // event play song when click song
    //  lang nghe parent cua no thay vi lang nghe chinh no. vo doi khi render lai ma render thi lai phai gan event rar mat time, o dau ko can
    playlist.onclick = (event) => {
      //.closet(selector) no se tim selector tinh tu no cho den khi tim duoc dung mo ta selector
      //  trong bai nay no se tim element tinh tu no co class va song va khac class .active
      const closestSong = event.target.closest(".song:not(.active)");
      const closestOption = event.target.closest(".option");
      // Do option nam trong song. len kiem tra neu ma song va khi click != option nua.
      if (closestSong && !closestOption) {
        this.currentIndex = parseInt(closestSong.dataset.index);
        this.loadSong();
        this.render();
        audio.play();
      }

      // khi click option
      if (closestOption) {
        // handle code
      }
    };
  },

  // random index song
  randomIndex() {
    let valueRandom = 0;
    do {
      valueRandom = Math.floor(Math.random() * this.songs.length);
    } while (valueRandom === this.currentIndex);
    return valueRandom;
  },

  // scroll song to view
  scrollToSong() {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }); // keo element goi no hien thi tren DOM
    }, 200);
  },
  //render playlist song
  render() {
    const htmls = this.songs.map(
      (song, index) =>
        `
          <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
              <div class="thumb"
                  style="background-image: url('${song.image}')">
              </div>
              <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
              </div>
          </div>
        `,
    );
    playlist.innerHTML = htmls.join("");
  },
  //define object for object app
  defineProperties() {
    //  no se hieu cuurent song la property thuc chat cuurentSong  = get();
    Object.defineProperty(this, "currentSong", {
      get() {
        return this.songs[this.currentIndex];
      },
    });
  },

  loadSong() {
    heading.innerText = this.currentSong.name;
    cdThumb.style.backgroundImage = ` url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },

  start() {
    this.loadConfig();
    this.defineProperties();
    this.loadSong();
    this.render();
    this.cdThumbAnimate.pause();
    this.handleEvent();
  },
};

app.start();
