document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    let input = document.getElementById('select-cities'),
        defaultList = document.querySelector('.dropdown-lists__list--default'),
        closeBtn = document.querySelector('.close-button'),
        selectList = document.querySelector('.dropdown-lists__list--select'),
        refBtn = document.querySelector('.button'),
        autocompliteList = document.querySelector('.dropdown-lists__list--autocomplete'),
        lang = document.cookie;

    const capitalizeFirstLetter = (stringToCapitalize) => {
        let strArr = [...stringToCapitalize];
        strArr[0] = strArr[0].toUpperCase();
        stringToCapitalize = strArr.join('');
        return stringToCapitalize;

    };
    const getFormatedString = (loweredName, cityQ) => {

        let formatedName = '';
        let reg = new RegExp(`${cityQ}`, 'i');
        let splitedStr = loweredName.split(reg);

        splitedStr.forEach((splited, i) => {

            let pattern = cityQ;
            if (i === 0 && splited === '') {
                pattern = capitalizeFirstLetter(pattern);
            }
            if (splitedStr[i + 1] === undefined) {
                formatedName += splited;
                return;
            }
            formatedName += splited + `<b>${pattern}</b>`;
        });

        return formatedName;
    };

    const dbQuery = (e) => {


        return fetch('./db_cities.json')
            .then(response => {

                return response.json();
            }).then(data => {
                localStorage.setItem('Countries', JSON.stringify(data[lang]));
                return data;
            }
            )

    };

    //Выводим города(country обьект с данными,cityQ, город который ввел пользователь)
    const getCities = (country, cityQ) => {

        let arrOfCities = [];

        for (let { name, count, link } of country.cities) {
            let loweredName = name.toLowerCase();

            //Ставим флаг,если пользователь ввел город
            if (cityQ) {

                //Проверяем,если есть сходство с тем что ввел у нас в базе.
                if (loweredName.includes(cityQ)) {
                    //Форматируем строку которая будет выводиться в списке,выделяя совпадающую часть.
                    let formatedName = getFormatedString(name, cityQ);
                    let cityElement = `
        <div class="dropdown-lists__line ">
            <div class="dropdown-lists__city dropdown-lists__city"  data-link= ${link}>${formatedName}</div>
            <div class="dropdown-lists__count">${count}</div>
          </div>
            `;

                    arrOfCities.push(cityElement);
                }

            } else {
                let cityElement = `
            <div class="dropdown-lists__line ">
                <div class="dropdown-lists__city dropdown-lists__city"  data-link= ${link}>${name}</div>
                <div class="dropdown-lists__count">${count}</div>
              </div>
                `;
                arrOfCities.push(cityElement);
            }
        }
        return arrOfCities;

    };

    //Сортировать страны поставив первой ту,язык которой выбран
    const sortCountries = (a, b) => {



        if (lang === 'RU') {

            if (a.count === 144500000) { return -1; }
            else { return 1; }
        } else if (lang === 'EN') {

            if (a.count === 53012456) { return -1; }
            else { return 1; }
        } if (lang === 'DE') {

            if (a.count === 82175684) { return -1; }
            else { return 1; }
        }




    };

    //Получаем DropList который на нужен.
    const getDropdownListCol = (data, countryQ, cityQ) => {

        let allCountriesBlock = document.createElement('div');
        allCountriesBlock.classList.add('dropdown-lists__col');


        data[lang].sort(sortCountries);

     

        for (let country of data[lang]) {
            let countryBlock = document.createElement('dropdown-lists__countryBlock');
            let allow = false;

            let countryElement = `
            <div class="dropdown-lists__total-line">
            <div class="dropdown-lists__country">${country.country}</div>
            <div class="dropdown-lists__count">${country.count}</div>
          </div>
            
            `;

            let arrCities = getCities(country, cityQ);
            if (arrCities.length <= 0) { continue; }


            if (countryQ) {

                if (countryQ === country.country) {
                    allow = true;
                    countryBlock.insertAdjacentHTML('afterbegin', countryElement);
                }
            } else {
                allow = true;
                countryBlock.insertAdjacentHTML('afterbegin', countryElement);
            }

            for (let city of arrCities) {
                if (!allow) { break; }
                countryBlock.insertAdjacentHTML('beforeend', city);

            }

            allCountriesBlock.appendChild(countryBlock);
        }


        return allCountriesBlock;
    };

    const setListDefault = (data) => {
        defaultList.innerHTML = '';
        dbQuery().then(data => defaultList.appendChild(getDropdownListCol(data)));
    };

    const setListSelectCountry = (e, data) => {

        const target = e.target;

        //  defaultList.style.display = 'none';

        selectList.innerHTML = '';
        selectList.appendChild(getDropdownListCol(data, target.textContent));
        selectList.style.display = 'block';

        input.value = target.textContent;
        closeBtn.style.display = 'block';


    };

    const setListSelectedCity = (e, data) => {

        let target = e.target;
        let clostsetList = target.closest('.dropdown-lists__list');
        clostsetList.style.display = 'none';
        closeBtn.style.display = 'block';
        input.value = e.target.textContent;
        refBtn.setAttribute('href', target.dataset.link);

    };

    const listClickHandler = (e) => {

        dbQuery()
            .then(data => {
                let target = e.target;
                let countryClick = target.closest('.dropdown-lists__country');
                let cityClick = target.closest('.dropdown-lists__city');

                if (countryClick) {
                    if (target.closest('.dropdown-lists__list--default')) {

                        defaultList.style.transform = 'translateX(-100%)';
                        selectList.style.transform = 'translateX(-100%)';
                    } else if(target.closest('.dropdown-lists__list--autocomplete')){

                        defaultList.style.transform = 'translateX(0)';
                        selectList.style.transform = 'translateX(0)'; 
                    }
                    setListSelectCountry(e, data);


                } else if (cityClick) {
                    autocompliteList.style.display= 'none';

                    defaultList.style.display = 'none';
                    defaultList.style.transform = 'translateX(0)';
                    setListSelectedCity(e, data);
                }
            });
    };

    const checkCookie = () => {

        if (!lang) {
            let date = new Date('2030/01/01');
            lang = prompt('Введите зачение EN RU DE');
            document.cookie = `lang=${lang};expires=${date}`;
        }
        lang = document.cookie;
        lang = lang.split('=')[1];
    };

    const init = () => {

        checkCookie();
        document.addEventListener('click', (e) => {

            let target = e.target;
            if (!target.closest('.input-cities')) {

                defaultList.style.display = 'none';
                defaultList.style.transform = 'translateX(0)';
                selectList.style.display = 'none';
                autocompliteList.style.display = 'none';
                closeBtn.style.display = 'none';
                refBtn.setAttribute('href', '#')
                input.value = '';

            }

        });
        selectList.addEventListener('click', listClickHandler);
        defaultList.addEventListener('click', listClickHandler);
        autocompliteList.addEventListener('click', listClickHandler);
        closeBtn.addEventListener('click', () => {

            closeBtn.style.display = 'none';
            input.value = '';
            selectList.style.display = 'none';
            defaultList.style.display = 'none';
            defaultList.style.transform = 'translateX(0)';
            refBtn.setAttribute('href', '#');
        });

        input.addEventListener('click', () => {


            if (defaultList.style.display === 'block') {
                selectList.style.display = 'none';
                defaultList.style.transform = 'translateX(0)';
                return;
            }

            input.value = '';
            selectList.style.display = 'none';
            setListDefault();
            defaultList.style.display = 'block';
        });

        input.addEventListener('input', () => {

            dbQuery()
                .then(data => {

                    let value = input.value.toLowerCase().trim();
                    if (value === '') {
                        defaultList.style.display = 'block';
                        defaultList.style.transform = 'translateX(0)';

                        selectList.style.display = 'none';
                        autocompliteList.style.display = 'none';

                    }
                    if (value !== '') {

                        defaultList.style.display = 'none';
                        selectList.style.display = 'none';
                        autocompliteList.style.display = 'block';
                        autocompliteList.innerHTML = '';
                        let colmn = getDropdownListCol(data, undefined, value);
                        autocompliteList.appendChild(colmn);
                        if (colmn.innerHTML === '') {
                            colmn.innerHTML = '<b>Совпадений не найдено<b/>';
                        }

                    }





                });




        });
    };


    init();

















});