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
function loadCreatePollInfo() {
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
        redirectToPage(Pages.Groups);

        return;
    }

    // Inserts default values to cloned poll object
    createdPoll.group_id        = groupId;
    createdPoll.initial.value_1 = groupId;

    // Reformata new data and inserts it to global variable
    setNewPollData();

    // Inserts poll data and values to elements
    insertPollData(createdPollData);

    // Adds option buttons listeners
    addPollOptionsListener();
}

// Inserts formatted data to poll container and its elements
function insertPollData(data = DEFAULT_POLL_DATA, ids = DEFAULT_POLL_IDS) {
    // Terminate if both array lengths are not equal
    if (data.length != ids.length) return; 

    // Loops through each value in passed data variable
    for (let i = 0; i < data.length; i++) {
        // Gets element for current iteration
        let element = getElement(ids[i]);

        /* Proceed if element actually exists
         * and adds text value found in current iteration
         */
        if (element != null) {
            // Gets type of object from data
            let type = data[i][1] != null ? data[i][1] : "input";

            // Determines what attribute to modify
            if (type == "input")
                element.value = data[i][0];
            else if (type == "text")
                element.innerHTML = data[i][0];
        }
    }
}

// Creates poll data
function setNewPollData() {
    // Creates new array with new data
    let pollData = [
        [createdPoll.initial.section_title],
        [createdPoll.initial.sub_title_1],
        [createdPoll.initial.sub_title_2],
        [createdPoll.initial.sub_title_3],
        [createdPoll.initial.value_1],
        [createdPoll.initial.value_2],
        [createdPoll.initial.value_3],
        [createdPoll.details.section_title]
    ];

    // Gets the length of details object
    const sectionCount = Object.keys(createdPoll.details).length;

    // Loop only if number of detail sections is greater than zero
    if (sectionCount > 0) {
        // Loops through each section and adds new data
        for (let i = 0; i < sectionCount - 1; i++) {
            // Current section in iteration
            let currentSection = createdPoll.details[i];

            // Creates new data for current section
            let sectionData = [
                [currentSection.sub_title],
                [currentSection.option.placeholder, "text"],
                [currentSection.option.placeholder],
                [currentSection.info.placeholder],
            ];

            // Adds all section element to the new poll data
            sectionData.forEach(section => pollData.push(section));
        }
    }

    // Sets current and global variable to a modified replacement
    createdPollData = pollData;
}

// Gets values from front-end 
function getNewPollData(data = DEFAULT_POLL_DATA, ids = DEFAULT_POLL_IDS) {
    // Terminate if element ids is null
    if (ids == null) return;

    // Terminate if createdPollData length is not same as ids length
    if (data.length != ids.length) return;

    // Resets current, global variable
    insertedCreateData = [];

    // Initialization of new poll data array
    let createData = [];

    // Loop through ids and get element values
    for (let i = 0; i < ids.length; i++) {
        // Gets type of object from data
        let type = data[i][1] != null ? data[i][1] : "input";

        // Gets current id based on id
        let currentElement = getElement(ids[i]);

        // Determines what attribute to fetch from
        if (type == "input") {
            // Pushes id and current element input value
            createData.push([ids[i], currentElement.value]);
        } else if (type == "text") {
            // Pushes id and current element innerHTML value
            createData.push([ids[i], currentElement.innerHTML]);
        } else if (type == "placeholder") {
            // Current select input parent
            let optionsInputContainer = currentElement.parentNode;
            
            // Creation for select values data
            let values = [];

            // Loops through and pushes multiple input to values array
            for (let j = 1; j < optionsInputContainer.childNodes.length; j++) {
                // Current input or option
                let option = optionsInputContainer.childNodes[j];

                // Continue or skip if element is not input
                if (option.tagName != "input".toUpperCase())
                    continue;

                // Continue or skip if element id is "placeholder"
                if (stringContains(option.id, "placeholder"))
                    continue;

                // Adds select input values to values array
                values.push(option.id, option.value);
            }
            
            // Pushes sub array with another sub array for select values
            createData.push([ids[i], currentElement.value, values]);
        }
    }

    // Sets newly created data to global variable
    insertedCreatePollData = createData;
}

// Attempts to create poll with inserted data
function createPollInsertedObject() {
    // Gets inserted data from site
    getNewPollData();

    // Resets current and global inserted data object
    insertedCreatePollStructure = {};

    // Loops through data array and construct
    for (let i = 0; i < insertedCreatePollData.length; i++) {
        // Primary element id and data
        let primaryId   = insertedCreatePollData[i][0];
        let primaryData = insertedCreatePollData[i][1];
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

// Attempts to fetch accessible groups based on current user privileges
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
    } else return data;

    // Add only if pollId is not empty
    if (pollId != "") {
        // Add key and value to params
        params.keys.push("poll_id");
        params.values.push(pollId);
    }
    
    /* Executes an AJAX request (Vanilla JS, not jQuery)
     * with the given url, function contains optional arguments
     */
    let result = request(POLL_API_URL, params, "GET");
    
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

// Receives all polls within a specific group and adds each poll data
function fetchGroupPolls(group, token) {
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
                users.push(result["data"][0]);
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

// Adds group polls to a specified container
function insertGroupPolls(containerId, polls) {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Gets the container element
    let container = getElement(containerId);

    /* Loops through and adds new poll block 
     * based on current index of iteration
     */
    for (let i = 0; i < polls.length; i++) {
        // Adds a new poll block
        container.appendChild(createPollBlockElement(polls[i]));
    }
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
    let inputCount = 0;

    // Increments option count if tagName is "option"
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
function createPollBlockElement(poll) {
    // Creates poll block element
    let pollContainer = createElement("div", "", "poll");
    
    // Poll title or name
    let pollTitle = createElement("h4");

    // Adds title
    pollTitle.innerHTML = "Formulär #";

    // Poll date
    let pollDate = createElement("p");

    // Adds date as text
    pollDate.innerHTML = "2018-1-1";

    // Poll id
    let pollId = createElement("a");
    
    // Adds poll id
    pollId.innerHTML = "AA-P-1";

    // Appends all children to poll block
    pollContainer.appendChild(pollTitle);
    pollContainer.appendChild(pollDate);
    pollContainer.appendChild(pollId);

    // Returns newly created element
    return pollContainer;
}

// Resets poll counters
function resetPollCounters() {
    // Reset pollCount if its value is greater than zero
    if (pollCount > 0) pollCount = 0;
}

// Adds a new option value
function addPollOptionsListener(placeholder = "Alternativ") {
    // Parameter values
    const sectionId   = "section-2";
    const selectId    = "select-";

    // Adds add option to all elements accordingly
    for (let i = 0; i < SUB_SECTION_LENGTH + 1; i++) {
        // Current and correct index
        const index = i + 1;

        // Current add option button id
        const addOptionId       = `section-2-select-${index}-add-option`;
        const removeOptionId    = `section-2-select-${index}-remove-option`; 

        // Variable created to reduce length of syntaxes
        let addFunction = function() {
            addOptionInput(sectionId, selectId + index, placeholder);
        }

        // Second ariable created to reduce length of syntaxes
        let removeFunction = function() {
            removeOptionInput(sectionId, selectId + index);
        }

        // Adds listener to add and remove button
        addListener(addOptionId, () => addFunction());
        addListener(removeOptionId, () => removeFunction());
    }
}