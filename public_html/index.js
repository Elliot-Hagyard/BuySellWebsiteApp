const URL = location.href;
/** Sends the post request when the submit button is pressed.
 * Essentialy, it's replacing a form, since I was running issues with the body being empty.
 * 
 * @param {String} elementId Specifies from which parent div to get the body elements
 * @param {String} params Other information to add the URL
 */
function sendData(elementId, params) {
    let form = document.getElementById(elementId)
    let object = {}
    for (divs of form.children) {
        for (el of divs.children) {
            if (el.value != undefined) {
                // The HTML input elements have the class name as the label for JSON dicitionary.
                object[el.className] = el.value
            }
        }
    }
    fetch(URL + elementId + params,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(object)
        }
    ).catch(er => console.log('ERROR: not sure why lol'))
    // Clear the elements of the form
    for (let divs of form.children) {
        for (let el of divs.children) {
            if (el.value != undefined) {
                el.value = ""
            }
        }
    }
} 