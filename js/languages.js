define([],function () {

    var kkbd = [
        "А", "а", "Б", "б", "В", "в", "Г", "г", "Д", "д", "Е", "е", "Ё", "ё", "Ӗ", "ӗ", "Ж", "ж", "З", "з", "И", "и", "Й", "й", "К", "к", "Л", "л", "ԕ", "ԕ", "М", "м", "Н", "н", "Ҥ", "ҥ", "О", "о", "Ӧ", "ӧ", "П", "п", "Р", "р", "Ԗ", "ԗ", "С", "с", "Т", "т", "У", "у", "Ӱ", "ӱ", "Ф", "ф", "Х", "х", "Ц", "ц", "Ч", "ч", "Ш", "ш", "Щ", "щ", "Ъ", "ъ", "Ы", "ы", "Ӹ", "ӹ", "Ь", "ь", "Э", "э", "Ӭ", "ӭ", "Ю", "ю", "Я", "я", "Ы̆", "ы̆", "Ŏ", "ŏ"
    ];
    var lkbd = [
        "A", "a", "Ä", "ä", "Å", "å", "B", "в", "C", "c", "Ç", "ç", "D", "d", "Ə", "ә", "E", "e", "F", "f", "G", "g", "Y", "y", "I", "i", "J", "j", "K", "k", "L", "l", "M", "m", "N", "n", "O", "o", "Ö", "ö", "P", "p", "R", "r", "S", "s", "Ş ş", "T", "t", "U", "u", "V", "v", "X", "x", "Z", "z", "Ƶ", "ƶ", "Ь", "ь", "rx", "lh"
    ];

    return {
        "selected": "mor",
        "languages": [
            {
                "code":"fi",
                "name":"Suomi",
                "keyboard":lkbd
            },
            {
                "code":"ers",
                "name":"Ersä",
                "keyboard":kkbd
            },
            {
                "code":"moks",
                "name":"Mokša",
                "keyboard":kkbd
            },
            {
                "code":"veps",
                "name":"Vepsä",
                "keyboard":lkbd,
            },
            {
                "code":"ingrian",
                "name":"Inkeroinen",
                "keyboard":lkbd
            },
            {
                "code":"meadowmari",
                "name":"Niittymari",
                "keyboard":kkbd
            },
            {
                "code":"hillmari",
                "name":"Vuorimari",
                "keyboard":kkbd
            },
            {
                "code":"ru",
                "name":"Venäjä",
                "keyboard":kkbd
            }
        ]
    }
});
