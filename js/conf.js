define([],function () {
    var kkbd = [
        "А", "а", "Ä", "ä", "Б", "б", "В", "в", "Г", "г", "Д", "д", "Е", "е", "Ё", "ё", "Ӗ", "ӗ", "Ж", "ж", "З", "з", "И", "и", "Й", "й", "К", "к", "Л", "л", "ԕ", "ԕ", "М", "м", "Н", "н", "Ҥ", "ҥ", "О", "о", "Ӧ", "ӧ", "П", "п", "Р", "р", "Ԗ", "ԗ", "С", "с", "Т", "т", "У", "у", "Ӱ", "ӱ", "Ф", "ф", "Х", "х", "Ц", "ц", "Ч", "ч", "Ш", "ш", "Щ", "щ", "Ъ", "ъ", "Ы", "ы", "Ӹ", "ӹ", "Ь", "ь", "Э", "э", "Ӭ", "ӭ", "Ю", "ю", "Я", "я", "Ы̆", "ы̆", "Ŏ", "ŏ"
    ];
    var lkbd = [
        "A", "a", "Ä", "ä", "Å", "å", "B", "в", "C", "c", "Ç", "ç", "D", "d", "Ə", "ә", "E", "e", "F", "f", "G", "g", "Y", "y", "I", "i", "J", "j", "K", "k", "L", "l", "M", "m", "N", "n", "O", "o", "Ö", "ö", "P", "p", "R", "r", "S", "s", "Ş", "ş", "T", "t", "U", "u", "V", "v", "X", "x", "Z", "z", "Ƶ", "ƶ", "Ь", "ь", "rx", "lh", "̅",
        "Æ", "æ", "Ø", "ø", "«", "»", "⸗", "ⅰ", "ⅿ", "ı", "ʼ", "“"
    ];
    var latinkbd = [
        "A", "a", "B", "b", "C", "c", "D", "d", "E", "e", "F", "f", "G", "g", "H", "h", "I", "i", "J", "j", "K", "k", "L", "l", "M", "m", "N", "n", "O", "o",
        "P", "p", "Q", "q", "R", "r", "S", "s", "T", "t", "U", "u", "V", "v", "W", "w", "X", "x", "Y", "y", "Z", "z"
    ];
    var livkbd = [
        "A",  "Ä", "B", "D",  "Ḑ", "E", "F", "G", "H", "I", "J", "K", "L", "Ļ", "M", "N", "Ņ", "O", "Ȯ", "Õ", "P", "R", "Ŗ", "S", "Š", "T", "Ț", "U", "V", "Z", "Ž", "C", "Q", "W", "X", "Y",
        "a", "ä", "b", "d", "ḑ", "e", "f", "g", "h", "i", "j", "k", "l", "ļ", "m", "n", "ņ", "o", "ȯ", "õ", "p", "r", "ŗ", "s", "š", "t", "ț", "u", "v", "z", "ž", "c", "q", "w", "x", "y",
        "Ā", "Ǟ", "Ē", "Ī", "Ō", "Ȱ", "Ȭ", "Ū",
        "ā", "ǟ", "ē", "ī", "ō", "ȱ", "ȭ", "ū", "&shy;"
    ];

    var nenetskbd = [
        "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "Ӈ", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я",
        "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "ӈ", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ",	"ъ", "ы", "ь", "э", "ю", "я",
        "ӈ", "Ӈ", "ʼ", "ˮ"
    ];

    var nenetscyrkbd = [

    ];

    var khantykbd = [
        "А", "Ӓ", "Ӑ", "Б",	"В", "Г", "Д", "Е",	"Ё", "Ә", "Ӛ", "Ж",	"З", "И", "Й", "К", "Қ", "Л", "Ӆ", "Ԓ",	"М", "Н", "Ң", "Ӈ",	"О", "Ӧ", "Ө", "Ӫ",	"П", "Р",
        "а", "ӓ", "ӑ",	"б", "в", "г", "д",	"е", "ё", "ә", "ӛ", "ж", "з", "и", "й",	"к", "қ", "л", "ӆ",	"ԓ", "м", "н", "ң",	"ӈ", "о", "ӧ", "ө",	"ӫ", "п", "р",
        "С", "Т", "У", "Ӱ",	"Ў", "Ф", "Х", "Ҳ",	"Ц", "Ч", "Ҷ", "Ш",	"Щ", "Ъ", "Ы", "Ь",	"Э", "Є", "Є̈",	"Ю", "Ю̆","Я", 	"Я̆",
        "с", "т", "у",	"ӱ", "ў", "ф", "х",	"ҳ", "ц", "ч", "ҷ",	"ш", "щ", "ъ", "ы",	"ь", "э", "є", "є̈", "ю", "ю̆",	"я", "я̆"
    ];

    var selkbd = [
        "A", "а", "ӄн", "Ӱ", "ӱ", "Å",  "å", "Б", "б", "Л", "л", "Х", "x", "В", "в", "ль", "Ц", "ц", "в", "М", "м", "Ч", "ч", "в", "Н", "н", "ч",
        "Г", "нь", "Ш", "ш", "Д", "д", "Ӈ", "ӈ", "ш", "Е", "е", "О", "о", "Щ", "щ", "e", "Ӧ", "ӧ", "щ", "Ё", "ё", "Œ", "œ", "Ъ", "ъ", "Ж", "ж",
        "Ә", "ә", "Ы", "ы", "З", "з", "ә", "Ь", "ь", "И", "и", "П", "п", "Э", "э", "Й", "й", "Р", "р", "Ю", "ю", "йо", "С", "с", "ю", "К", "к",
        "Т", "т", "Я", "я", "Ӄ", "ӄ", "У", "у", "я"
    ];

    var karkbd = [
        "A", "a", "Ä", "ä", "B", "b", "C", "c", "Ç", "ç", "D", "d",  "E", "e", "F", "f", "G", "g", "H", "h", "I", "i", "J", "j", "K", "k", "L", "l",
        "M", "m", "N", "n", "O", "o", "Ö", "ö", "P", "p", "R", "r", "S", "s", "Ş", "ş",  "T", "t", "Y", "y", "U", "u", "V", "v", "Z", "z", "Ƶ", "ƶ", "з", "ь", "ȷ"
    ];

    var skokbd = [
        "А", "а", "Â", "â", "B", "b", "В", "в", "C", "c", "Č", "č", "Ʒ", "ʒ", "Ǯ", "ǯ", "D", "d",
        "Đ", "đ", "Ḑ", "ḑ", "E", "e", "F", "f", "G", "g",	"Ǧ", "ǧ", "Ǥ", "ǥ",	"H", "h", "I",  "i",
        "J", "j", "K", "k",	"Ǩ", "ǩ", "Ķ", "ķ", "L", "l", "Ļ","ļ", "M", "m", "M̹" ,  "ṃ" , "N", "n", "Ŋ", "ŋ", "O", "o",
        "Õ", "õ", "P", "p",	"R", "r", "Ŗ", "ŗ", "S", "s", "Š", "š", "S̷", "s̷", "Ş", "ş", "T", "t", "Ţ", "ţ", "Ẓ", "ẓ", "З", "з",  "U", "u", "V", "v",
        "Z", "z", "Ž", "ž", "Ƶ", "ƶ", "Å", "å", "Ä", "ä", "ʹ", "Ә", "ә", "Є", "є", "Ь", "ь", "Ņ", "ņ"
    ];

    var mnskbd = [
        "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "Ӈ", "О", "П", "Р", "С", "Т", "У", "Ў", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ә", "Ю", "Я",
        "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "ӈ", "о", "п", "р", "с", "т", "у", "ў", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ә", "ю", "я"
    ];

    var udmkbd = [
        "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "Ӝ", "З", "Ӟ", "И", "Ӥ", "Й", "К", "Л", "М", "Н", "Ӈ", "О", "Ӧ", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ӵ", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ә", "Ю", "Я",
        "а", "б", "в", "г", "д", "е", "ё", "ж", "ӝ", "з", "ӟ", "и", "ӥ", "й", "к", "л", "м", "н", "ӈ", "о", "ӧ", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ӵ", "ш", "щ", "ъ", "ы", "ь", "э", "ә", "ю", "я"
    ];
    
    var smakbd = latinkbd.concat([
            "Â", "â", "Č", "č", "Š", "š", "Ž", "ž", "Đ", "đ", "Ŋ", "ŋ", "Ï", "ï", "Ä", "ä", "Ö", "ö", "Å", "å",  "Æ", "æ", "Ø", "ø"
    ]);

    return {

        buttons: [
            /*
            {
                id:'edit-layout',
                toggle:true,
                icon:'icon-th',
                title:'Edit page layout',
                modes:['page'],
                event:'toggleShowLayout',
            }
            */
            {
                id: 'download-xml',
                index: 44,
                toggle: false,
                active: false,
                icon: 'icon-download',
                title: 'Download page XML',
                modes: ['page'],
                event: 'downloadXml'
            },
            {
                id:'show-highlight',
                index: 33,
                toggle:true,
                active:true,
                icon:'icon-font',
                title:'Show editor word highlight',
                modes:['page'],
                event: 'toggleShowHighlight'
            },
            {
                id:'back',
                index: 3,
                toggle: false,
                icon: 'icon-backward',
                title: 'Go back to the collection',
                modes:['page'],
                event: 'goBackToCollection'
            },
            {
                id:'zoom-in',
                index: 11,
                toggle:false,
                icon:'icon-zoom-in',
                title:'Zoom in',
                modes:['page'],
                event:'zoomIn'
            },

            {
                id:'zoom-out',
                index: 12,
                toggle:false,
                icon:'icon-zoom-out',
                title:'Zoom out',
                modes:['page'],
                event:'zoomOut'
            
            },

            {
                id:'pan-zoom',
                index: 13,
                toggle:true,
                icon:'icon-move',
                title:'Mouse wheel pan/zoom',
                modes:['page'],
                event:'panZoom'
            },

            {
                id:'layout-selector',
                index: 52,
                toggle:true,
                active: false,
                icon:'icon-repeat',
                title:'Horizontal / vertical layout',
                modes:['page'],
                event:'changeLayout'
            },
            {
                id:"save",
                index: 62,
                toggle:false,
                text:"Save",
                title:"Save",
                modes:["page"],
                event: 'saveDocument'
            },
            {
                id:'tag',
                index: 63,
                toggle:false,
                text:'Tag',
                title:'Tag',
                modes:['page'],
                event:'tagWord'
            },
            {
                id:'toggle-linebreaks',
                index: 21,
                toggle:true,
                active:true,
                icon:'icon-align-left',
                title:'Line break after each text line',
                modes:['page'],
                event:'toggleLineBreak'
            },

            {
                id:'highlight-editor-word',
                index: 22,
                toggle:true,
                active:true,
                icon:'icon-star',
                title:'Highlight word under cursor in editor',
                modes:['page'],
                event:'highlightEditorWord'
            },

            {
                id:'show-saved-changes',
                index: 23,
                toggle:true,
                active:true,
                icon:'icon-check',
                title:'Show unsaved changes',
                modes:['page'],
                event:'showSavedChanges'
            },

            {
                id:'show-original-changes',
                index: 24,
                toggle:true,
                active:true,
                icon:'icon-edit',
                title:'Show changes made to original',
                modes:['page'],
                event:'showOriginalChanges'
            },

            {
                id:'show-language',
                index: 25,
                toggle:true,
                active:true,
                icon:'icon-globe',
                title:'Show language of words',
                modes:['page'],
                event:'showLanguage'
            }


        ],

        shortcuts : [

            {
                code: 113,
                modes: ['page'],
                event: 'panZoom'
            },
            {
                code: 33,
                modes: ['page'],
                event: 'pagePrevious'
            },

            {
                code: 34,
                modes: ['page'],
                event: 'pageNext'
            },
        ],
        "selected_language": "Finnish",
        "languages": [
            {
                "code":"liv",
                "name": "Livonian",
                "keyboard": livkbd
            },
            {
                "code":"fi",
                "name":"Finnish",
                "keyboard":lkbd
            },
            {
                "code":"ers",
                "name":"Erzya",
                "keyboard":kkbd
            },
            {
                "code":"moks",
                "name":"Moksha",
                "keyboard":kkbd
            },
            {
                "code":"veps",
                "name":"Veps",
                "keyboard":lkbd
            },
            {
                "code":"ingrian",
                "name":"Ingrian",
                "keyboard":lkbd
            },
            {
                "code":"meadowmari",
                "name":"Meadow Mari",
                "keyboard":kkbd
            },
            {
                "code":"hillmari",
                "name":"Hill Mari",
                "keyboard":kkbd
            },
            {
                "code":"ru",
                "name":"Russian",
                "keyboard":kkbd
            },
            {
                "code": "oldfi",
                "name": "Old Literary Finnish",
                "keyboard": lkbd
            },
            {
                "code": "la",
                "name": "Latin",
                "keyboard": latinkbd
            },
            {
                "code": "yrk",
                "name": "Nenets",
                "keyboard": nenetskbd

            },
            {
                "code": "sel",
                "name": "Selkup",
                "keyboard": selkbd
            },
            {
                "code": "krl",
                "name": "Karelian",
                "keyboard": karkbd
            },
            {
                "code": "sms",
                "name": "Skolt Sami",
                "keyboard": skokbd
            },
            {
                "code": "kca",
                "name": "Khanty",
                "keyboard": khantykbd
            },
            {
                "code": "mns",
                "name": "Mansi",
                "keyboard": mnskbd
            },
            {
                "code": "udm",
                "name": "Udmurt",
                "keyboard": udmkbd
            },
            {
                "code": "sma",
                "name": "Southern Sami",
                "keyboard": smakbd
            }
            {
                "code": "ignore",
                "name": "Ignore"
            }
        ],
        "urls": {
            "docBase": '/api/id/<id>/pages/'
        }
    };

});
