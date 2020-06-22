var HScreen = screen.availHeight + "px";
/* $(".header").css({ height: HScreen }); */
// Кнопка Вверх
$(function () {
  var ScreenVisibility = window.innerHeight; // высота видимости экрана

  $(window).scroll(function () {
    if ($(window).scrollTop() > ScreenVisibility) {
      $(".top").css({ display: "block" });
    } else {
      $(".top").css({ display: "none" });
    }
  });
});
$(".top").on("click", function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, "300");
});
$(".top").on("mouseover", function () {
  $(".text").css({ color: "#d4e010" });
});
$(".top").on("mouseout", function () {
  $(".text").css({ color: "#8f95a3" });
});

//Проверка на заполнение пользователем всех фильтров поиска и вывод модального окна
function Check() {
  var filter_item = $("select option:selected"); // все выбранные select
  var filterValue = [];
  for (var i = 0; i < filter_item.length; i++) {
    filterValue.push(filter_item[i].value); // массив значений всех выбранных select
  }
  // проверка выбора пользователем месяца/реки/типа - true/false
  var checkFilter = filterValue.some(function (item) {
    return item == 0;
  });

  // проверка валидности ввода цены
  var price = $("input[data-price]"); // все input цен
  var price_check = [];
  for (var i = 0; i < price.length; i++) {
    if (!/^\d+$/.test(price[i].value) && price[i].value != "") {
      price_check.push(price[i].value);
    }
  }

  if (checkFilter) {
    $(".modal").addClass("modal-active"); // вывод модального окна о необходимости выбора параметров
  } else if (price_check.length != 0) {
    $(".modal_price").addClass("modal-active"); // вывод модального окна о необходимости корректного указания цен
  } else {
    return Find(); //Фильтр и вывод результатов, если пользователь заполнил фильтры
  }
}
$(".button-search").on("click", Check);

// закрытие модального окна
$(".close_msg").on("click", function () {
  $(".modal").removeClass("modal-active");
  $(".modal_price").removeClass("modal-active");
});

//Фильтр и вывод результатов
function Find() {
  var _month = $("option[name~='month']:selected").val(), // выбранный месяц
    _rive = $("option[name~='location']:selected").val(), // выбранная река
    _type = $("option[name~='type-tourism']:selected").val(), // выбранный тип похода
    _min_price, // минималная сумма
    _max_price, // максимальная сумма
    newBlock;

  // проверка на ввод пользователем сумм
  // min
  if ($("input[name~='min_price']").val() == "") {
    _min_price = 0;
  } else {
    _min_price = +$("input[name~='min_price']").val();
  }
  // max
  if ($("input[name~='max_price']").val() == "") {
    _max_price = 5000;
  } else {
    _max_price = +$("input[name~='max_price']").val();
  }

  Clear();

  $.ajax({
    url: "./js/data.json",
    dataType: "json",
    success: function (resp) {
      //Фильтруем массив по заданным условиям пользователя
      var result = resp.filter(function (item) {
        if (
          item.month == _month &&
          item.rive == _rive &&
          item.price >= _min_price &&
          item.price <= _max_price &&
          item.type == _type
        ) {
          return true;
        }
      });

      // Вывод результатов на сайт
      if (result.length !== 0) {
        result.forEach(function (item) {
          newBlock = `
          <div class="collection-item-outer">
            <div class="collection-item">
                <img src="${item.src}" alt="rafting">
                <div class="pohod-title text_padding">${item.title}<i class="far fa-check-circle check"></i></div>
                <div class="price">${item.price} грн</div>
                <div class="pohod-date text_padding">
                  <i class="fas fa-calendar-alt"></i>${item.month_date}
                </div>
                <div class="pohod-level text_padding">Уровень сложности: ${item.level}</div>
                <div class="collection-text text_padding">
                    <div class="collection-text-small">
                        Описание тура:</br>
                        ${item.desribe}</br>
                        </br>
                        <p>В стоимость включено:</br>
                        - обеспечение водным снаряжением - плавсредства, каски, весла, жилеты;</br>
                        - обеспечение бивуачным снаряжением - тент, котлы, горелки, палатки, спальники, коврики и др.;</br>
                        - питание на маршруте (утро - вечер - горячая кухня, обед перекус, первый и последний день - 2-х разовое);</br>
                        - опытные инструктора;</br>
                        - страховка;</br>
                        - автомобиль сопровождения для перевозки вещей.
                    </div>
                <button class="show knob">Подробнее</button>                     
                </div>
            </div>
          </div>`;
          $(".results").append(newBlock);
          Reset_filter(); //сброс фильтров
        });
      } else {
        newBlock = `<div class="no-result">
          <p>По вашему запросу не найдено походов</p>
        </div>`;
        $(".results").append(newBlock);
        Reset_filter(); // сброс фильтров
      }
    },
    error: function (req, status, err) {
      console.log("что-то пошло не так", status, err);
    },
  });

  // сброс фильтров
  function Reset_filter() {
    $("#tourism")[0].reset();
  }
}
//Очищение результатов от предыдущих поисков
function Clear() {
  if ($(".results").has(".collection-item-outer")) {
    $(".results").empty();
  }
}

// Кнопка Подробнее/Скрыть в блоке Похода
var ShowText = function (e) {
  var height_text = $(this).siblings(".collection-text-small").height();
  if (height_text == 55) {
    $(this).siblings(".collection-text-small").addClass("collection-text-full");
    $(this).text("Скрыть");
  } else {
    $(this)
      .siblings(".collection-text-small")
      .removeClass("collection-text-full");
    $(this).text("Подробнее");
  }
};
$("body").on("click", ".show", ShowText);

// Добавление в избранное
$("body").on("click", ".check", function () {
  $(this).toggleClass("chosen");
  if ($(this).hasClass("chosen")) {
    var favorite_ = $(".chosen").closest(".collection-item-outer").html();
    setFavorite(favorite_);
  }
});
/*--------Хранение в Localstorage--------*/
function setFavorite(favorite_) {
  var dataFavorite = [
    {
      data: favorite_,
    },
  ];
  if (localStorage.getItem("myFavorites") !== null) {
    var favorites = localStorage.getItem("myFavorites");
    var LastFavorite = JSON.parse(favorites);
    var newFavorite = LastFavorite.concat(dataFavorite);

    var storeArr = JSON.stringify(newFavorite);
    localStorage.setItem("myFavorites", storeArr);
  } else {
    var storeArr = JSON.stringify(dataFavorite);
    localStorage.setItem("myFavorites", storeArr);
  }
}

$(".button-favorite").on("click", getFavorite);
function getFavorite() {
  Clear();
  var favorites = localStorage.getItem("myFavorites");
  if (favorites !== null) {
    var dataFavorite = JSON.parse(favorites);

    dataFavorite.forEach(function (item) {
      var newBlock = `<div class="collection-item-outer">${item.data}</div>`;
      $(".results").append(newBlock);
    });
  } else {
    console.log("no data");
  }
}

//-----------------ОТЗЫВЫ -----------------------------------------------------
var index = 0;
$(document).ready(GetReviews());
$(document).ready(Reviews_hide());

function Reviews_hide() {
  $(".review_item").each(function (i) {
    $(".review_item")
      .eq(++i)
      .hide();
  });
}

$(".arrow_next").on("click", moveRight);

function moveRight() {
  $(".arrow_prev").show();
  $(".review_item").eq(index).hide();
  $(".review_item")
    .eq(++index)
    .show();
  if (index === $(".review_item").length - 1) {
    // Убираем "правую" стрелку, если справа слайдов больше нет
    $(".arrow_next").hide();
  }
}

$(".arrow_prev").on("click", moveLeft);

function moveLeft() {
  $(".arrow_next").show();
  $(".review_item").eq(index).hide();
  $(".review_item")
    .eq(--index)
    .show();
  if (index === 0) {
    $(".arrow_prev").hide();
  }
}

// добавление отзыва
$(".collection-add").on("click", AddBlock);

/*---------Add post Button---------*/
function AddBlock(e) {
  e.preventDefault();
  var scr_img = $("input[name='url_img']").val();
  var title_text = $("input[name='title']").val();
  var area = $("textarea").val();
  var currDate = new Date();
  var date = currDate.toDateString();

  var newBlock = `<div class="review_item">
  <img src="${scr_img}" class="reviews_foto" alt="">
  <div class="reviews_title">${title_text}</div>
  <div class="postDate">${date}</div>
  <div class="reviews1">
      <p class="review_text">${area}</p>
  </div>
</div>`;
  $(".slider_").prepend(newBlock);

  Reviews_hide();
  SetReview(scr_img, title_text, date, area); // запись в localStorage
}

function SetReview(scr_img, title_text, date, area) {
  var dataReview = [
    {
      avatar: scr_img,
      title: title_text,
      date: date,
      text: area,
    },
  ];
  console.log("dataReview-->", dataReview);

  if (localStorage.getItem("myReviews") !== null) {
    var posts = localStorage.getItem("myReviews");
    var LastReview = JSON.parse(posts);
    var newReview = LastReview.concat(dataReview);

    var storeArr = JSON.stringify(newReview);
    localStorage.setItem("myReviews", storeArr);
  } else {
    var storeArr = JSON.stringify(dataReview);
    localStorage.setItem("myReviews", storeArr);
  }
}

/*-----Get from Localstorage-------*/
function GetReviews() {
  var posts = localStorage.getItem("myReviews");
  if (posts !== null) {
    var dataReview = JSON.parse(posts);
    console.log(dataReview);

    dataReview.forEach(function (item, i) {
      var newBlock = `<div class="review_item">
      <img src="${item.avatar}" class="reviews_foto" alt="">
      <div class="reviews_title">${item.title}</div>
      <div class="postDate">${item.date}</div>
      <div class="reviews1">
          <p class="review_text">${item.text}</p>
      </div>
    </div>`;
      $(".slider_").prepend(newBlock);
      Reviews_hide();
    });
  } else {
    console.log("no data");
  }
}

//------------------------------------------

//---------- GALLERY foto ------------------
$("#gallery").on("click", function () {
  $("#gallery-foto").toggle();
  multiItemSlider(".slider", {
    isAutoplay: true,
  });
});

$(".close").click(function () {
  $("#gallery-foto").toggle();
});

var multiItemSlider = (function () {
  return function (selector, config) {
    var mainElement = document.querySelector(selector), // основный элемент блока
      sliderWrapper = mainElement.querySelector(".slider_wrapper"), // обертка для .slider-item
      sliderItems = mainElement.querySelectorAll(".slider_item"), // элементы (.slider-item)
      sliderControls = mainElement.querySelectorAll(".slider_control"), // элементы управления
      sliderControlLeft = mainElement.querySelector(".slider_control_prev"), // кнопка "prev"
      sliderControlRight = mainElement.querySelector(".slider_control_next"), // кнопка "next"
      wrapperWidth = parseFloat(getComputedStyle(sliderWrapper).width), // ширина обёртки
      itemWidth = parseFloat(getComputedStyle(sliderItems[0]).width), // ширина одного элемента
      positionLeftItem = 0, // позиция левого активного элемента
      transform = 0, // значение транфсофрмации .slider_wrapper
      step = (itemWidth / wrapperWidth) * 100, // величина шага (для трансформации)
      items = [], // массив элементов
      _timerId;
    _config = {
      isAutoplay: false, // автоматическая смена слайдов
      directionAutoplay: "next", // направление смены слайдов
      delayAutoplay: 2500, // интервал между автоматической сменой слайдов
      isPauseOnHover: true, // устанавливать ли паузу при поднесении курсора к слайдеру
    };

    // наполнение массива _items
    sliderItems.forEach(function (item, index) {
      items.push({ item: item, position: index, transform: 0 });
    });

    // настройка конфигурации слайдера в зависимости от полученных ключей
    for (var key in config) {
      if (key in _config) {
        _config[key] = config[key];
      }
    }

    var position = {
      getMin: 0,
      getMax: items.length - 1,
    };

    // функция, выполняющая смену слайда в указанном направлении
    var transformItem = function (direction) {
      if (direction === "next") {
        if (
          positionLeftItem + wrapperWidth / itemWidth - 1 >=
          position.getMax
        ) {
          return;
        }
        if (!sliderControlLeft.classList.contains("slider_control_show")) {
          sliderControlLeft.classList.add("slider_control_show");
        }
        if (
          sliderControlRight.classList.contains("slider_control_show") &&
          positionLeftItem + wrapperWidth / itemWidth >= position.getMax
        ) {
          sliderControlRight.classList.remove("slider_control_show");
        }
        positionLeftItem++;
        transform -= step;
      }
      if (direction === "prev") {
        if (positionLeftItem <= position.getMin) {
          return;
        }
        if (!sliderControlRight.classList.contains("slider_control_show")) {
          sliderControlRight.classList.add("slider_control_show");
        }
        if (
          sliderControlLeft.classList.contains("slider_control_show") &&
          positionLeftItem - 1 <= position.getMin
        ) {
          sliderControlLeft.classList.remove("slider_control_show");
        }
        positionLeftItem--;
        transform += step;
      }
      sliderWrapper.style.transform = "translateX(" + transform + "%)";
    };

    // обработчик события click для кнопок "назад" и "вперед"
    var controlClick = function (e) {
      if (e.target.classList.contains("slider_control")) {
        e.preventDefault();
        var direction = e.target.classList.contains("slider_control_next")
          ? "next"
          : "prev";
        transformItem(direction);
        _startAutoplay();
      }
    };

    var setUpListeners = function () {
      // добавление к кнопкам "назад" и "вперед" обрботчика _controlClick для событя click
      sliderControls.forEach(function (item) {
        item.addEventListener("click", controlClick);
      });
    };

    // функция для запуска автоматической смены слайдов через промежутки времени
    var _startAutoplay = function () {
      if (!_config.isAutoplay) {
        return;
      }
      _stopAutoplay();

      _timerId = setInterval(function () {
        transformItem(_config.directionAutoplay);
      }, _config.delayAutoplay);
    };

    // функция, отключающая автоматическую смену слайдов
    var _stopAutoplay = function () {
      clearInterval(_timerId);
    };

    // инициализация
    setUpListeners();
    _startAutoplay();

    return {
      right: function () {
        // метод right
        transformItem("next");
      },
      left: function () {
        // метод left
        transformItem("prev");
      },
      stop: function () {
        // метод отключающий автоматическую смену слайдов
        _config.isAutoplay = false;
        _stopAutoplay();
      },
      cycle: function () {
        // метод запускающий автоматическую смену слайдов
        _config.isAutoplay = true;
        _startAutoplay();
      },
    };
  };
})();

//-------------------------------------------------------------

// Меню-бургер для маленьких экранов/телефонов
$("#navToggle").click(function () {
  $(this).toggleClass("active");
  $(".overlay").toggleClass("open");
  $("body").toggleClass("locked");
  $(".title").toggle();
});

$(".menu-list").on("click", function () {
  $(this).toggleClass("active");
  $(".overlay").toggleClass("open");
  $("body").toggleClass("locked");
  $("#navToggle").toggleClass("active");
  $(".title").toggle();
});
