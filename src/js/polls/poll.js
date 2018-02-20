/****************************************************
*                                                   *
*                AA-Polls - poll.js                 *
*                                                   *
*        Date of development : December 2017        *
*                                                   *
*       Copyrights @ https://github.com/BluDay      *
*                                                   *
*                      (o.0)                        *
*                                                   *
* /**************************************************
*/

// Used to load information for newly initiated poll
function loadCreatePollData() {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Gets the id of the current group from url
    let groupId = getUrlParam("group_id");

    // Gets current group based on given id
    let currentGroup = getPollGroup(groupId);

    // Terminate if group was not found
    if (currentGroup == null) {
        alert("Kunde inte skapa formulär");

        // Redirect admin back to page
        redirectToPage(getInitialPage(currentStatus));

        return;
    }

    // Set current poll to default created poll
    currentPoll = createdPoll;

    // Inserts default values to cloned poll object
    currentPoll.group_id        = groupId;
    currentPoll.initial.value_1 = groupId;

    // Reformata new data and inserts it to global variable
    currentPollData = setNewPollData(currentPoll);

    // Inserts poll data and values to elements
    insertPollData(currentPollData, DEFAULT_POLL_IDS);

    // Adds option buttons listeners
    addPollOptionsListener();
}

// Fetches current poll data and assigns all elements with data
function loadPoll() {
    // Used to check whether poll is template or not
    let template = false;

    // Gets the id of the current group from url
    let pollId = getUrlParam("id");
    let userId = getUrlParam("user_id");

    /* Checks whether current user is a super user
     * or an admin and sets template to true if 
     * user id parameter is null
     */
    if (currentUser.super_user == "1" || currentUser.admin == "1")
        if (userId == null) template = true;

    // Gets current group based on given id
    currentPoll = getUserPoll(pollId, template);

    // Terminate if group was not found
    if (currentPoll == null) {
        alert("Kunde inte hitta formulär");

        // Redirect admin back to page
        redirectToPage(getInitialPage(userStatus));

        return;
    } else currentPoll = currentPoll.poll;

    // Determines if current poll already is submitted
    let submitted = false;

    // Sets submitted to true if user_id exists as key
    if (currentPoll.user_id != undefined)
        submitted = true;

    // Reformata new data and inserts it to global variable
    currentPollData = setNewPollData(currentPoll, true);

    // Cloned ids array
    modifiedIds = DEFAULT_POLL_IDS;

    // Sets information text if found
    if (currentPoll.info_text != "") {
        // Gets the info text paragraph element
        let infoText = getElement("poll-info-text");
        
        // Sets info text
        infoText.innerHTML = currentPoll.info_text;
    } else {
        // Adds info_text key in poll object
        let defaultText = "Ingen information tillgänglig";

        // Adds both values
        currentPollData[0] = currentPoll["info_text"] = [defaultText];
    }

    // Removes submit button
    if (submitted) removeElement("submit-poll");

    // Input bar listeners
    let inputOutputIds = [
        ["general-rate-", currentPoll.general_rate],
        ["section-2-rate-3-", currentPoll.details[2].rate],
    ];

    // Adds listener to each input and output element
    for (let i = 0; i < inputOutputIds.length; i++) {
        // Passes input event and output id
        let func = function(e) {
            // Adds pass new element value listener function
            passElementValueListener(e, inputOutputIds[i][0] + "output");
        }

        // Gets input and output elements
        let output  = getElement(inputOutputIds[i][0] + "output"),
            input   = getElement(inputOutputIds[i][0] + "input");

        // Adds input and output values
        output.value = input.value = inputOutputIds[i][1];

        // Disable if submitted is true
        if (submitted) {
            input.setAttribute("disabled", "");
            output.setAttribute("disabled", "");
        }

        // Adds listener to element
        addListener(inputOutputIds[i][0] + "input", func, "input");
    }

    // Sections sub section count
    const sectionCount = Object.keys(currentPoll).length - 1;
    
    // Removes unused id which causes errors if not used properly
    for (let i = 0; i < sectionCount; i++) {
        // Gets the current section select
        let selectId = `section-2-select-${i + 1}-option-`;

        /* Used to exit second loop and
        * increase speed of iteration
        */
        let modified = false;

        // Loops through each id and value
        for (let j = 0; j < modifiedIds.length; j++) {
            // Exit current loop if ids already is modified
            if (modified) break;

            // If first select data was found, change it
            if (modifiedIds[j][0] == selectId + "0") {
                // Change the current id
                modifiedIds[j][0] = modifiedIds[j][0].replace("-option-0", "");

                // Change the current id value
                modifiedIds[j][1] = modifiedIds[j][1].replace("placeholder", "values");

                // Attempts to remove next element
                if (modifiedIds[j + 1] != null) {
                    // Deletes the unecessary id and value
                    modifiedIds.splice(j + 1, 1);

                    // Sets modified to true
                    modified = true;
                } 
            }

            // Changes id node target from "placeholder" to "text"
            if (stringContains(modifiedIds[j][1], "placeholder"))
                modifiedIds[j][1] = modifiedIds[j][1].replace("placeholder", "text");
        }

        // If info text is not empty, change type from placeholder to text
        if (currentPoll.details[i] != undefined) {
            // Used to shorten code
            let details = currentPoll.details[i];

            if (details.info.text != "") {
                // Loops through new poll data
                for (let j = 0; j < currentPollData.length; j++) {
                    /* Proceed if element with current 
                     * placeholder value was found
                     */
                    if (currentPollData[j][0] == details.info.placeholder) {
                        // Sets the placeholder to text and changes value
                        currentPollData[j][0] = details.info.text;
                        currentPollData[j][1] = "text";

                        // Exits sub iteration
                        break;
                    }
                }
            }
        }
    }

    // Inserts poll data and values to elements
    insertPollData(currentPollData, modifiedIds, submitted);
}

// Fetches all polls assigned to current user (Not done yet)
function loadUserPolls(callback = null) {
    // Call a custom and passed callback function
    if (callback != null) {
        /* Creates a cloned callback function and passes
         * fetched data as parameter for external and quick access
         */
        const execCallback = (passedData) => callback(passedData);

        // Executes the cloned function
        execCallback();
    }

    // Gets the id of the current group from url
    let userId = getUrlParam("user_id");

    // Resets user id to current user id
    if (userId == undefined || userId == null)
        userId = currentUser.id;

    // Fetches all accessible groups based on admin status
    fetchUserPolls(currentUser.token, userId);

    // Return nothing if users is null
    if (submittedPolls == null && nonSubmittedPolls == null) {
        // Make user aware of progress failure
        alert("Kunde inte hämta formulär, försök igen.");

        // Exit function
        return;
    }
}

// Inserts formatted data to poll container and its elements
function insertPollData(data, ids, disableAll = false) {
    // Terminate if data or ids is nullified
    if (data == null || ids == null) return;

    // Terminate if both array lengths are not equal
    if (data.length != ids.length) return;

    // Loops through each value in passed data variable
    for (let i = 0; i < data.length; i++) {
        // Gets element for current iteration
        let element = getElement(ids[i][0]);

        /* Proceed if element actually exists
         * and adds text value found in current iteration
         */
        if (element != null) {
            // Gets type of object from data
            let type = data[i][1] != null ? data[i][1] : "input";

            // Determines what attribute to modify
            if (type == "input") {
                // Sets element value to current data value
                element.value = data[i][0];
            } else if (type == "text") {
                // Sets element inner HTML value to current data value
                element.innerHTML = data[i][0];
            } else if (type == "placeholder") {
                // Sets element placeholder to current data value
                element.placeholder = data[i][0];
            } else if (type == "select") {
                // Gets the select element
                let select = getElement(ids[i][0]);

                // Removes all default options
                removeChildren(ids[i][0]);

                // Loops through each option
                for (let j = 0; j < data[i][0].length; j++) {
                    // Creates a new option id
                    let optionId = `${ids[i][0]}-option-${j + 1}`;

                    // Creates a new option element
                    let option = createElement("option", optionId);

                    // Adds current value to the new option
                    option.innerHTML = data[i][0][j];

                    // Appends new option to the select element
                    select.appendChild(option);
                }
            }

            // Disable the element if disableAll is true
            if (disableAll && type != "select") 
                element.setAttribute("disabled", "");
        }
    }
}

// Creates poll data
function setNewPollData(poll, selectValues = false) {
    // Creates new array with new data
    let pollData = [
        [poll.info_text != null ? poll.info_text : ""], 
        [poll.initial.section_title],
        [poll.initial.sub_title_1],
        [poll.initial.sub_title_2],
        [poll.initial.sub_title_3],
        [poll.initial.value_1],
        [poll.initial.value_2],
        [poll.initial.value_3],
        [poll.details.section_title]
    ];

    // Determines the length of all sub sections
    const sectionCount = Object.keys(poll.details).length - 1;

    // Loop only if number of detail sections is greater than zero
    if (sectionCount > 0) {
        // Loops through each section and adds new data
        for (let i = 0; i < sectionCount; i++) {
            // Current section in iteration
            let currentSection = poll.details[i];

            // Creates new data for current section
            let sectionData = [[currentSection.sub_title]];

            // Gets current section option values
            let values = currentSection.option.values;

            /* Sets section option values to placeholder
             * if option values array length is zero
             */
            if (values.length < 1)
                values.push(currentSection.option.placeholder);

            // Defines select data and determines to add placeholder or not
            let selectData = !selectValues ? [[values[0], "placeholder"]] : [];  

            // Adds select data
            selectData.push([values, "select"]);

            // Adds given select data accordingly
            selectData.forEach(element => sectionData.push(element));

            // Default select value
            let textType = "placeholder";

            // If selectValues is not true, change text type to text
            if (!selectValues) textType = "text";

            // Push last section data
            sectionData.push([currentSection.info.placeholder, textType]);

            // Adds all section element to the new poll data
            sectionData.forEach(section => pollData.push(section));
        }
    }

    // Returns final and formatted data
    return pollData;
}

// Gets values from front-end 
function getNewPollData(data, ids) {
    // Terminate if element ids is null
    if (data == null || ids == null) return;

    // Terminate if poll data length is not same as ids length
    if (data.length != ids.length) return;

    // Resets current, global variable
    insertedCreateData = [];

    // Initialization of new poll data array
    let pollData = [];

    // Loop through ids and get element values
    for (let i = 0; i < ids.length; i++) {
        // Gets type of object from data
        let type = data[i][1] != null ? data[i][1] : "input";

        // Gets current id based on id
        let currentElement = getElement(ids[i][0]);

        // Skip if element is null
        if (currentElement == null) continue;

        // Determines what attribute to fetch from
        if (type == "input" || type == "placeholder") {
            // Pushes id and current element input value
            pollData.push([ids[i][0], currentElement.value]);
        } else if (type == "text") {
            // Pushes value instead of innerHTML if it is empty
            let value = currentElement.innerHTML != "" 
                ? currentElement.innerHTML
                : currentElement.value;

            // Pushes id and current element innerHTML value
            pollData.push([ids[i][0], value]);
        } else {
            // Current select input parent
            let optionsInputContainer = currentElement.parentNode;
            
            // Creation for select values data
            let values = [];

            // Loops through and pushes multiple input to values array
            for (let j = 0; j < optionsInputContainer.childNodes.length; j++) {
                // Current input or option
                let option = optionsInputContainer.childNodes[j];

                // Continue or skip if element is not input
                if (option.tagName != "input".toUpperCase())
                    continue;

                // Creates new input data to push
                let inputData = [option.id];
                
                // If option value is empty, replace with placeholder value
                if (option.value == "") 
                    option.value = currentPollData[i][0];
                
                // Pushes value to inputData
                inputData.push(option.value);

                // Adds select input values to values array
                values.push(inputData);
            }
            
            // Pushes sub array with another sub array for select values
            pollData.push(values);
        }
    }

    // Sets newly created data to global variable
    return pollData;
}

// Attempts to create poll with inserted data
function createPollInsertedObject(data, ids) {
    // Gets inserted data from site
    insertedCreatePollData = getNewPollData(data, ids);
    
    // Resets current and global inserted data object
    insertedCreatePollStructure = currentPoll;

    // Terminate if poll object is null
    if (insertedCreatePollStructure == null) return;

    // Loops through data array and construct
    for (let i = 0; i < insertedCreatePollData.length; i++) {
        // Primary element id and data
        let primaryId   = insertedCreatePollData[i][0];
        let primaryData = insertedCreatePollData[i][1];

        // Loops through default poll element ids array
        for (let j = 0; j < ids.length; j++) {
            // Splits current JSON key id for reference
            let keys = ids[j][1].split(".");

            /* Checks for current element id in global 
             * poll ids array and proceeds if found
             */
            if (primaryId == ids[j][0]) {
                // Assigns variable to key as parent based on index
                let currentKey = insertedCreatePollStructure;

                // Sets new key each sequence in iteration
                for (let k = 0; k < keys.length; k++) {
                    // Add poll data value to current poll object key
                    if (k == keys.length - 1 && keys[k] != "values")
                        currentKey[keys[k]] = primaryData;

                    // Sets the key to a new and child key
                    currentKey = currentKey[keys[k]];

                    /* Proceeds if current object key is "option" and
                     * current key values array is either greater or
                     * lesser than zero to determine submission type sequence
                     */
                    if (keys[k] == "option" && currentKey.values.length <= 1) {
                        // Proceed if next index and value is not null or empty
                        if (insertedCreatePollData[i + 1] != null) {
                            // Determines if current data is apart of a picker
                            if (typeof insertedCreatePollData[i + 1][0] == "object" &&
                                insertedCreatePollData[i + 1].length > 0) {
                                // Adds first value as selected value
                                currentKey.selected = insertedCreatePollData[i + 1][0][1];

                                // Removes first option element from values
                                currentKey.values = [];
                                
                                // Adds select option values if there is any
                                for (let l = 0; l < insertedCreatePollData[i + 1].length; l++) {
                                    // Current option value
                                    let optionValue = insertedCreatePollData[i + 1][l][1];

                                    // Skip if value is empty
                                    if (optionValue == "" || optionValue == insertedCreatePollData[i][1])
                                        continue;

                                    // Adds a select option value to values array
                                    currentKey.values.push(optionValue);
                                }       
                                
                                // Pushes default value if array length is zero
                                if (currentKey.values.length <= 0)
                                    currentKey.values.push(insertedCreatePollData[i + 1][0][1]);
                            }
                        }
                    } else if (keys[k] == "option" && currentKey.values.length > 1) {
                        /* Checks if current id does not contain "option" in it
                         * and attempts to add the selected value to selected key
                         */
                        if (keys[k] == "option" && !stringContains(ids[i][0], "option"))
                            currentKey.selected = insertedCreatePollData[i][1];
                    }
                }
            }
        }
    }
}

// Gets current group based on passed id
function getPollGroup(groupId) {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Loops through each group
    for (let i = 0; i < fetchedGroups.length; i++) {
        // Sets currentGroup to current object in iteration
        if (groupId == fetchedGroups[i].id) {
            // Set currentGroup to object
            return fetchedGroups[i];
        }
    }

    // Return null if not found
    return null;
}

// Gets current group based on passed id
function getUserPoll(pollId, template = false) {
    // Merges non submitted and submitted polls
    let polls = submittedPolls.concat(nonSubmittedPolls);

    // Sets polls to fetchedPolls if template is true
    if (template) polls = fetchedPolls;
    
    // Loops through each poll
    for (let i = 0; i < polls.length; i++) {
        // Checks if poll exists
        if (pollId == polls[i].id) {
            // Returns matched poll
            return polls[i];
        }
    }

    // Return null if poll was not found
    return null;
}

// Adds group polls to a specified container
function insertUserPollsData(containerId, polls) {
    // Gets the container element
    let container = getElement(containerId);

    /* Loops through and adds new poll block 
     * based on current index of iteration
     */
    for (let i = 0; i < polls.length; i++) {
        // Sets custom function to current poll
        let func = function() {
            location.href = `poll.html?id=${polls[i]["id"]}`;
        }

        // Gets the index from the poll data
        let index = parseInt(polls[i]["id"].replace("AA-P-", ""));

        // Creates the poll block
        let poll = createPollBlockElement(polls[i], index, func);

        // Adds a new poll block
        container.appendChild(poll);
    }
}

// Attempts to get and format new poll data
function sendPoll(submit = false) {
    // Sets default id
    let ids = submit ? modifiedIds : DEFAULT_POLL_IDS;

    // Reformats select option array values
    if (submit) {
        // Loops through current poll data
        for (let i = 0; i < currentPollData.length; i++) {
            /* Proceeds if first index is an sub array
             * and if second index value is "select"
             */
            if (typeof currentPollData[i][0] == "object" ||
                currentPollData[i][1] == "select") {
                // Skip if select options length is one
                if (currentPollData[i][0].length <= 1) continue;
                    
                // Gets selected value of select option element
                let select = getElement(ids[i][0]);

                // Gets selected and first option
                const first       = currentPollData[i][0][0];
                const selected    = select.value;

                // Gets the index of the selected value
                const optionIndex = currentPollData[i][0].indexOf(selected);

                // Sets the new data
                currentPollData[i][0][0]            = selected;
                currentPollData[i][0][optionIndex]  = first;

                // Gets current poll object
                let currentKey = currentPoll;

                // Gets keys 
                let keys = ids[i][1].replace(".values", ".selected").split(".");

                // Sets new key each sequence in iteration
                for (let j = 0; j < keys.length; j++) {
                    // Add poll data select value to poll object
                    if (j == keys.length - 1) 
                        currentKey[keys[j]] = selected;

                    // Sets the key to a new and child key
                    currentKey = currentKey[keys[j]];
                }
            }
        }
    }

    // Attempts to create new poll data
    createPollInsertedObject(currentPollData, ids);

    // Add input bar rates if submit is true
    if (submit) {
        // Array with all input bar ids
        let inputRateBars = [
            ["general_rate", "general-rate-input"],
            ["details.2.rate", "section-2-rate-3-input"],
            ["details.3.rate", "section-2-rate-4-input"]
        ];

        // Loops through each bar
        for (let i = 0; i < inputRateBars.length; i++) {
            // Gets the input bar element
            let input = getElement(inputRateBars[i][1]);

            // Continues if value is null
            if (input == null) continue;

            // Separates all node keys
            let keys = inputRateBars[i][0].split(".");

            // Gets tree node
            let currentKey = insertedCreatePollStructure;

            // Loops through all keys
            for (let j = 0; j < keys.length; j++) {
                // Proceeds if node key is equaled to "rate"
                if (j == keys.length - 1) 
                    currentKey[keys[j]] = input.value;

                // Goes to the next node with current key
                currentKey = currentKey[keys[j]];
            }
        }
    }
}

// Attempts to submit newly created poll
function createPoll(token, poll, callback = null) {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Data variable to return
    let data = null;
    
    // Creates a new array for possible parameters
    let params = {};

    /* Gets the appropriate values and store them
     * according to a determined structure below
     */
    if (token != "" && poll != null) {
        params.keys     = ["token", "poll"];
        params.values   = [token, JSON.stringify(poll)];
    } else return data;
    
    /* Executes an AJAX request (Vanilla JS, not jQuery)
     * with the given url, function contains optional arguments
     */
    let result = request(POLL_API_URL, params, "PUT");
    
    /* If result is an object type, it will return
     * some data with from the endpoint, regardless whether it's
     * successful or not. If not, it will return an error string.
     */
    if (typeof result == "object") {
        // If the result was successful
        if (result["success"] && result["data"] != null) {
            // Call a custom and passed callback function
            if (callback != null) {
                /* Creates a cloned callback function and passes
                 * fetched data as parameter for external and quick access
                 */
                const execCallback = (passedData) => callback(passedData);

                // Executes the cloned function
                execCallback(result);
            }
        }

        // Assigns fetched data to data variable
        data = result;
    }

    // Returns final data
    return data;
}

// Attempts to submit newly created poll
function submitPoll(token, poll, callback = null) {
    // Data variable to return
    let data = null;
    
    // Creates a new array for possible parameters
    let params = {};

    /* Gets the appropriate values and store them
     * according to a determined structure below
     */
    if (token != "" && poll != null) {
        params.keys     = ["token", "poll"];
        params.values   = [token, JSON.stringify(poll)];
    } else return data;

    /* Executes an AJAX request (Vanilla JS, not jQuery)
     * with the given url, function contains optional arguments
     */
    let result = request(POLL_API_URL, params, "POST");
    
    /* If result is an object type, it will return
     * some data with from the endpoint, regardless whether it's
     * successful or not. If not, it will return an error string.
     */
    if (typeof result == "object") {
        // If the result was successful
        if (result["success"] && result["data"] != null) {
            // Call a custom and passed callback function
            if (callback != null) {
                /* Creates a cloned callback function and passes
                 * fetched data as parameter for external and quick access
                 */
                const execCallback = (passedData) => callback(passedData);

                // Executes the cloned function
                execCallback(result);
            }
        }

        // Assigns fetched data to data variable
        data = result;
    }

    // Returns final data
    return data;
}

// Attempts to fetch accessible polls based on current user privileges
function fetchPolls(token, pollId = "", callback = null) {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;
    
    // Data variable to return
    let data = null;
     
    // Creates a new array for possible parameters
    let params = {};

    /* Gets the appropriate values and store them
     * according to a determined structure below
     */
    if (token != "") {
        params.keys     = ["token"];
        params.values   = [token];

        // Adds poll id if not empty
        if (pollId != "") {
            params.keys.push("poll_id");
            params.values.push(pollId);  
        }
    } else return data;
    
    /* Executes an AJAX request (Vanilla JS, not jQuery)
     * with the given url, function contains optional arguments
     */
    let result = request(POLL_API_URL, params);
    
    /* If result is an object type, it will return
     * some data with from the endpoint, regardless whether it's
     * successful or not. If not, it will return an error string.
     */
    if (typeof result == "object") {
        // If the result was successful
        if (result["success"] && result["data"] != null) {
            // Stores polls locally in a global variable
            fetchedPolls = result["data"];

            // Call a custom and passed callback function
            if (callback != null) {
                /* Creates a cloned callback function and passes
                 * fetched data as parameter for external and quick access
                 */
                const execCallback = (passedData) => callback(passedData);

                // Executes the cloned function
                execCallback(result);
            }
        }

        // Assigns fetched data to data variable
        data = result;
    }

    // Returns final data
    return data;
}

// Attempts to fetch user polls from current user
function fetchUserPolls(token, userId, callback = null) {
    // Data variable to return
    let data = null;
     
    // Creates a new array for possible parameters
    let params = {};

    /* Gets the appropriate values and store them
     * according to a determined structure below
     */
    if (token != "") {
        params.keys     = ["token", "user_id"];
        params.values   = [token, userId];
    } else return data;
    
    /* Executes an AJAX request (Vanilla JS, not jQuery)
     * with the given url, function contains optional arguments
     */
    let result = request(POLL_API_URL, params);
    
    /* If result is an object type, it will return
     * some data with from the endpoint, regardless whether it's
     * successful or not. If not, it will return an error string.
     */
    if (typeof result == "object") {
        // If the result was successful
        if (result["success"] && result["data"] != null) {
            // Stores polls locally in a global variable
            let fetchedPollIds = result["data"];

            // Sets received ids to local and global variables
            submittedPolls      = fetchedPollIds["submitted"];
            nonSubmittedPolls   = fetchedPollIds["non_submitted"];

            // Call a custom and passed callback function
            if (callback != null) {
                /* Creates a cloned callback function and passes
                 * fetched data as parameter for external and quick access
                 */
                const execCallback = (passedData) => callback(passedData);

                // Executes the cloned function
                execCallback(result);
            }
        }

        // Assigns fetched data to data variable
        data = result;
    }

    // Returns final data
    return data;
}

// Receives all polls within a specific group and adds each poll data
function fetchGroupPolls(token, group) {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Terminate if group has invalid value
    if (group == null && token == null) return;

    // Modified group object
    let modifiedGroup = group;

    // User data array
    let polls = []; 

    // Loops through each group and adds data accordingly
    for (let i = 0; i < modifiedGroup.poll_ids.length; i++) {
        // Exit current loop if there are no ids
        if (modifiedGroup.poll_ids.length < 1) break;

        // Current poll id in iteration
        const pollId = modifiedGroup.poll_ids[i];

        // Attempts to fetch user data
        let result = fetchPolls(token, pollId);

        /* If result is an object type, it will return
        * some data with from the endpoint, regardless whether it's
        * successful or not. If not, it will return an error string.
        */
        if (typeof result == "object") {
            // If the result was successful
            if (result["success"] && result["data"] != null) {
                // Fetch each user and store them in 
                polls.push(result["data"][0]);
            }
        }
    }

    /* Add a new key to group and assign
    * users array variable as a value
    */
    modifiedGroup.polls = polls;

    // Return users for curr
    return modifiedGroup;
}

// Attempts to fetch submitted polls from a specific group with id
function fetchGroupSubmittedPolls(token, groupId, callback = null) {
    // Data variable to return
    let data = null;
     
    // Creates a new array for possible parameters
    let params = {};

    /* Gets the appropriate values and store them
     * according to a determined structure below
     */
    if (token != "") {
        params.keys     = ["token", "group_id"];
        params.values   = [token, groupId];
    } else return data;
    
    /* Executes an AJAX request (Vanilla JS, not jQuery)
     * with the given url, function contains optional arguments
     */
    let result = request(POLL_API_URL, params);
    
    /* If result is an object type, it will return
     * some data with from the endpoint, regardless whether it's
     * successful or not. If not, it will return an error string.
     */
    if (typeof result == "object") {
        // If the result was successful
        if (result["success"] && result["data"] != null) {
            // Stores polls locally in a global variable
            groupSubmittedPolls = result["data"];

            // Call a custom and passed callback function
            if (callback != null) {
                /* Creates a cloned callback function and passes
                 * fetched data as parameter for external and quick access
                 */
                const execCallback = (passedData) => callback(passedData);

                // Executes the cloned function
                execCallback(result);
            }
        }

        // Assigns fetched data to data variable
        data = result;
    }

    // Returns final data
    return data;
}

// Adds a new option to select element with id
function addOptionValue(sectionId, selectId, value) {
    // Terminate if value is empty
    if (value == "") return;

    // Gets the actual select id
    const selectElementId = `${sectionId}-${selectId}`;

    // Gets the select element
    let select = getElement(selectElementId);

    // Gets all children of select element
    const options = select.childNodes;
     
    // Boolean value to determine if element value was found
    let elementWithValueFound = false;

    // Number count for new id
    let optionsCount = 0;

    // Increments option count if tagName is "option"
    options.forEach(function(element) {
        // Checks only for elements with "option" as tag name
        if (element.tagName == "option".toUpperCase()) {
            /* Increment option count value and terminate
             * function if value already was found
             */
            if (value != element.innerHTML) {
                // Increments value by one
                optionsCount++;
            } else {
                // Set boolean to true
                elementWithValueFound = true;

                // Exits current loop
                return;
            }
        }
    });

    // Terminates if element with value was found
    if (elementWithValueFound) return;

    // New id for option
    const optionId = `${selectElementId}-option-${optionsCount}`;

    // Creates a new option element
    let option = createElement("option", optionId);

    // Set value for newly created option element
    option.innerHTML = value;

    // Appends option to select element
    select.appendChild(option);
}

// Adds a new input for a new value
function addOptionInput(sectionId, selectId, placeholder) {
    // Gets the actual select id
    const optionsContainerId = `${sectionId}-${selectId}-add-options`;
    
    // Gets the select element
    let optionsContainer = getElement(optionsContainerId);

    // Gets all children of option input container element
    const optionInputs = optionsContainer.childNodes;

    // Number count for new id
    let inputCount = 1;

    // Increments option count if tag name is "option"
    optionInputs.forEach(function(element) {
        if (element.tagName == "input".toUpperCase()) 
            inputCount++;
    });

    // New id for option
    const optionInputId = `${sectionId}-${selectId}-option-input-${inputCount}`;

    // Creates a new option element
    let input = createElement("input", optionInputId, "text-input");

    // Sets default placeholder
    input.placeholder = `${placeholder} ${inputCount}`;

    // Appends option to select element
    optionsContainer.appendChild(input);
}

// Adds a new option to select element with id
function removeOptionInput(sectionId, selectId) {
    // Gets the actual select id
    const optionsContainerId = `${sectionId}-${selectId}-add-options`;
    
    // Gets the select element
    let optionsContainer = getElement(optionsContainerId);

    // Gets last element
    let lastInput = optionsContainer.lastChild;

    // Terminates function if input is null
    if (lastInput == null) return;

    // Attempts to remove element based on id
    removeElement(lastInput.id);
}

// Creates a poll block element which contains poll data
function createPollBlockElement(data, index = 0, onclick = null) {
    // Creates poll block element
    let pollContainer = createElement("div", "", "poll");

    // Add onclick function if not null
    if (onclick != null)
        pollContainer.onclick = () => onclick();
    
    // Poll title or name
    let pollTitle = createElement("h4");

    // Adds title
    pollTitle.innerHTML = `Formulär #${index}`;

    // Poll date
    let pollDate = createElement("p");

    // Adds date as text
    pollDate.innerHTML = data.date;

    // Poll id
    let pollId = createElement("a");
    
    // Adds poll id
    pollId.innerHTML = data.id;

    // Appends all children to poll block
    pollContainer.appendChild(pollTitle);
    pollContainer.appendChild(pollDate);
    pollContainer.appendChild(pollId);

    // Returns newly created element
    return pollContainer;
}

// Adds a new option value
function addPollOptionsListener(placeholder = "Alternativ") {
    // Parameter values
    const sectionId = "section-2";
    const selectId = "select-";

    // Determines the length of all sub sections
    const sectionCount = Object.keys(currentPoll.details).length - 1;

    /* Adds add option to all elements accordingly
     * and the value of index is always increased by one
     * due to the existance of a default option input
     */
    for (let i = 1; i < sectionCount + 1; i++) {
        // Current add option button id
        const addOptionId = `section-2-select-${i}-add-option`;
        const removeOptionId = `section-2-select-${i}-remove-option`;

        // Variable created to reduce length of syntaxes
        let addFunction = function () {
            addOptionInput(sectionId, selectId + i, placeholder);
        }

        // Second ariable created to reduce length of syntaxes
        let removeFunction = function () {
            removeOptionInput(sectionId, selectId + i);
        }

        // Adds listener to add and remove button
        addListener(addOptionId, () => addFunction());
        addListener(removeOptionId, () => removeFunction());
    }
}

// Resets poll counters
function resetPollCounters() {
    // Reset pollCount if its value is greater than zero
    if (pollCount > 0) pollCount = 0;
}
