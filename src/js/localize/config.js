

/*

function checkUserLanguage(language) {
    //get the file name
    
    const redirectTo  = window.location

    if ( localStorage.getItem('language') === true){
        // check if user is in another page if so redirect
        if (window.location.href != Directory.SV){
            redirectTo.Directory.SV.Pages + currentPage
        } return 
        
    } else {
        if (window.location.href != Directory.EN) {
            redirectTo.Directory.EN.Pages + currentPage
        } return
        
    }
}



let language = localStorage.getItem('language')
checkUserLanguage(language)
*/

function getLanguage() { 
    const currentPage = window.location.pathname.split(/(\\|\/)/g).pop()
    if ( localStorage.getItem('language') != true){
        // check if user is in another page if so redirect
        window.location.replace('../pages/en/' + currentPage)
    } else {
       return null
    }
}

function setLanguage(language) { 
    // the default set user language is Swedish
    localStorage.setItem('language',true)
}

function chanageLanguage() {
    const language = getLanguage()
    console.log(language)
}

//console.log(path.dirname('/pages/en'))

setLanguage()
getLanguage()