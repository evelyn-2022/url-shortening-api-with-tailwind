// Mobile menu
const menuContainer = document.querySelector('.menu-container');
const menuIcon = document.querySelector('.menu-icon');

menuIcon.addEventListener('click', () => {
  menuContainer.classList.toggle('open');
});

///////////////////////////////////////////////////////////////////
// Shorten link
const shortenCon = document.querySelector('.shorten');
const resultsCon = document.querySelector('.results-container');
const shortenBtn = document.querySelector('.input button');
const userInp = document.querySelector('.input input');
const warning = document.querySelector('.warning');
let results = [];
class Result {
  constructor(id, orig, shortened) {
    this.id = id;
    this.orig = orig;
    this.shortened = shortened;
  }
}

getLocalStorage();

shortenBtn.addEventListener('click', () => {
  const inp = userInp.value;

  // Check for empty input
  if (inp.length === 0) {
    userInp.classList.add('invalid');
    warning.classList.remove('hidden');
    return;
  } else {
    userInp.classList.remove('invalid');
    warning.classList.add('hidden');
  }

  // Ajax call
  (async function (link) {
    try {
      const data = await getShortenedLink(link);
    } catch (err) {
      alert(err);
    }
  })(inp);

  // Clear user input
  userInp.value = '';
});

async function getShortenedLink(link) {
  try {
    // Render spinner
    renderSpinner();

    const res = await fetch(`https://api.shrtco.de/v2/shorten?url=${link}`);
    if (!res.ok) throw new Error('Please enter a valid link');

    const data = await res.json();
    const { full_short_link: shortLink, original_link: origLink } = data.result;
    const id = shortLink.slice(-6);

    // Remove spinner
    const spinner = document.querySelector('.result-loading');
    spinner.remove();

    // Render Result
    renderResult(id, origLink, shortLink);
    addToList(id, origLink, shortLink);
    setLocalStorage();

    // Add clear btn
    if (results.length === 1) {
      addClearBtn();

      const clearBtn = document.querySelector('.clear');
      clearBtn.addEventListener('click', () => {
        reset();
        clearBtn.remove();
      });
    }
  } catch (err) {
    throw err;
  }
}

function renderSpinner() {
  resultsCon.insertAdjacentHTML(
    'afterbegin',
    `       <div
              class="result-loading w-full h-[160px] flex flex-col justify-center bg-white rounded-lg md:py-4 md:px-6 md:h-[84px]"
            >
              <div
                class="flex w-full flex-row items-center justify-center"
              >
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
              </div>
            </div>`
  );
}

function renderResult(id, orig, shortened) {
  resultsCon.insertAdjacentHTML(
    'afterbegin',
    `     <div
            class="result w-full flex flex-col bg-white rounded-lg md:items-center md:flex-row md:justify-between md:py-4 md:px-6 md:text-xl md:space-x-6"
          >
            <!-- Original Link -->
            <div
              class="text-veryDarkViolet p-4 pb-3 border-b-[1px] border-b-gray/25 truncate md:border-none md:p-0"
            >
              ${orig}
            </div>

            <!-- Shortened Link -->
            <div
              class="flex flex-col px-4 md:flex-row md:items-center md:p-0 md:justify-end"
            >
              <a href="https://shrtco.de/dZKX6e" class="py-3 text-cyan"
                >${shortened}</a
              >
              <button
                id="${id}"
                onclick="copyText('${id}')"
                class="copy-btn bg-cyan text-white py-2.5 px-2 mb-4 rounded-md md:mb-0 md:text-lg md:w-32 md:ml-6"
              >
                Copy
              </button>
            </div>
          </div>`
  );
}

function addToList(id, orig, short) {
  const newRes = new Result(id, orig, short);
  results.push(newRes);
}

function addClearBtn() {
  shortenCon.insertAdjacentHTML(
    'beforeend',
    `     <button
            class="clear w-24 mt-3 italic text-sm text-grayishViolet underline decoration-dashed underline-offset-2 md:text-base md:pt-3 hover:text-veryDarkViolet"
          >
            &nbsp;Clear All&nbsp;
          </button>`
  );
}

function setLocalStorage() {
  localStorage.setItem('results', JSON.stringify(results));
}

function getLocalStorage() {
  const data = JSON.parse(localStorage.getItem('results'));

  if (!data) return;

  results = data;
  results.forEach(result => {
    renderResult(result.id, result.orig, result.shortened);
  });

  if (results.length > 0) {
    addClearBtn();

    const clearBtn = document.querySelector('.clear');
    clearBtn.addEventListener('click', () => {
      reset();
      clearBtn.remove();
    });
  }
}

function reset() {
  results = [];
  localStorage.removeItem('results');
  resultsCon.innerHTML = '';
}

function copyText(id) {
  const btn = document.getElementById(id);
  btn.textContent = 'Copied!';
  btn.style.backgroundColor = 'hsl(257, 27%, 26%)';
  const copyText = `https://shrtco.de/` + id;
  navigator.clipboard.writeText(copyText);
}
