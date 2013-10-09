define([],function () {
    var kkbd = [
        "А", "а", "Ä", "ä", "Б", "б", "В", "в", "Г", "г", "Д", "д", "Е", "е", "Ё", "ё", "Ӗ", "ӗ", "Ж", "ж", "З", "з", "И", "и", "Й", "й", "К", "к", "Л", "л", "ԕ", "ԕ", "М", "м", "Н", "н", "Ҥ", "ҥ", "О", "о", "Ӧ", "ӧ", "П", "п", "Р", "р", "Ԗ", "ԗ", "С", "с", "Т", "т", "У", "у", "Ӱ", "ӱ", "Ф", "ф", "Х", "х", "Ц", "ц", "Ч", "ч", "Ш", "ш", "Щ", "щ", "Ъ", "ъ", "Ы", "ы", "Ӹ", "ӹ", "Ь", "ь", "Э", "э", "Ӭ", "ӭ", "Ю", "ю", "Я", "я", "Ы̆", "ы̆", "Ŏ", "ŏ"
    ];
    var lkbd = [
        "A", "a", "Ä", "ä", "Å", "å", "B", "в", "C", "c", "Ç", "ç", "D", "d", "Ə", "ә", "E", "e", "F", "f", "G", "g", "Y", "y", "I", "i", "J", "j", "K", "k", "L", "l", "M", "m", "N", "n", "O", "o", "Ö", "ö", "P", "p", "R", "r", "S", "s", "Ş", "ş", "T", "t", "U", "u", "V", "v", "X", "x", "Z", "z", "Ƶ", "ƶ", "Ь", "ь", "rx", "lh"
    ];

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
                id:'show-index',
                index: 4,
                toggle:true,
                suppressInitialCB: true,
                icon:'icon-chevron-left',
                title:'Show index',
                modes:['page','document'],
                event: 'setDocumentOrPageMode'
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
                id:'toggle-linebreaks',
                index: 21,
                toggle:true,
                active:true,
                icon:'icon-align-left',
                title:'Line break after each text line',
                modes:['page'],
                event:'toggleLineBreak',
            },

            {
                id:'highlight-editor-word',
                index: 22,
                toggle:true,
                active:false,
                icon:'icon-star',
                title:'Highlight word under cursor in editor',
                modes:['page'],
                event:'highlightEditorWord',
            },

            {
                id:'show-saved-changes',
                index: 23,
                toggle:true,
                active:true,
                icon:'icon-check',
                title:'Show unsaved changes',
                modes:['page'],
                event:'showSavedChanges',
            },

            {
                id:'show-original-changes',
                index: 24,
                toggle:true,
                active:true,
                icon:'icon-edit',
                title:'Show changes made to original',
                modes:['page'],
                event:'showOriginalChanges',
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
            },


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
        "selected_language": "mor",
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
        ],
        "urls": {
            "docBase": '/api/id/<id>/pages/'
        }
    };

});
