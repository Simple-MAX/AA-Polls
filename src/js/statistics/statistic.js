/****************************************************
*                                                   *
*              AA-Polls - statistic.js              *
*                                                   *
*         Date of development : January 2018        *
*                                                   *
*       Copyrights @ https://github.com/BluDay      *
*                                                   *
*                      (o.0)                        *
*                                                   *
* /**************************************************
*/

// Gets min, max and average stats from polls
function getPollRateStats(groupData) {
    // Used to shorten code
    let group = groupData;

    /* Option object with data used for the chart
     * and data array to return later on
     */
    let data = [], statsData = [];

    /* Proceeds to format and create stats if
     * selected group polls is not null
     */
    if (group.polls != null) {
        // Loops through selected group polls
        for (let i = 0; i < group.polls.length; i++) {
            // Gets selected dates
            let startDate   = Date.parse(group.start_date),
                endDate     = Date.parse(group.end_date);

            // Creates a new stats object for current poll
            let stats = {
                label: group.polls[i].id,
                values: [0, 0, 0]
            };

            /* Continues or terminates if selected dates
             * exceeds minimum and maximum limit
             */
            if (Date.parse(group.polls[i].date) < startDate ||
                Date.parse(group.polls[i].date) > endDate) {
                // Set label to nothing or empty string
                stats.label = "";

                // Pushes stats to statsData
                statsData.push(stats);

                // Skips to next iteration
                continue;
            }

            // Min, max and general values
            let min = 0, max = 0, average = 0;

            // Loops through submitted polls
            for (let j = 0; j < group.submitted_polls.length; j++) {
                /* Proceed only if current poll id is
                 * same as current submitted poll id
                 */
                if (group.polls[i].id == group.submitted_polls[j].id) {
                    // Used to shorten code
                    let poll = group.submitted_polls[j].poll;

                    /* Sets min and max value if poll min value is 
                    * lesser than min value or if poll max value
                    * is greater than max value
                    */
                    if (j == 0 || min > parseInt(poll.general_rate))
                        min = parseInt(poll.general_rate);
                    if (j == 0 || max < parseInt(poll.general_rate))
                        max = parseInt(poll.general_rate);

                    // Increments average value with polls general rate value
                    average += parseInt(poll.general_rate);
                }
            }

            // Divides average value with the amount of submitted polls
            average /= group.submitted_polls.length;

            // Sets new and fetched values
            stats.values[0] = average;
            stats.values[1] = max;
            stats.values[2] = min;

            // Appends stats object to data array
            statsData.push(stats);
        }
    } else return;

    // Terminate if data is null
    if (statsData == null || statsData.length <= 0) 
        return;

    // Sets new stats data
    data = statsData;

    // Returns new stats data
    return data;
}

// Gets influcences stats from polls
function getPollInfluncesStats(groupData) {
    // Used to shorten code
    let group = groupData;
    
    /* Option object with data used for the chart
     * and data array to return later on
     */
    let data = [], statsData = [];

    /* Proceeds to format and create stats if
     * selected group polls is not null
     */
    if (group.polls != null) {
        // Gets poll details two
        let details = group.selected_poll.poll.details[2];

        // Loops through selected poll influences
        for (let i = 0; i < details.option.values.length; i++) {
            // Creates a new stats object for current poll
            let stats = {
                label: details.option.values[i],
                values: [0, 0, 0]
            };

            // Loops through submitted polls
            for (let j = 0; j < group.submitted_polls.length; j++) {
                // Gets the submitted poll, used to shorten code
                let submittedPoll = group.submitted_polls[j].poll;

                /* Proceed only if current poll id is
                 * same as current submitted poll id
                 */
                if (group.selected_poll.poll.id == submittedPoll.id &&
                    submittedPoll.details[2].option.selected == details.option.values[i]) {
                    // Used to shorten code
                    let poll = group.submitted_polls[j].poll;

                    // Gets submitted poll details
                    let subPollDetails = poll.details[2];

                    // Gets rate value
                    let value = parseInt(subPollDetails.rate);

                    // Corrects value if limit exceeded
                    if (value > 2) value = 2;
                    if (value < 0) value = 0;

                    // Sets new rate
                    stats.values[value] += 1;
                }
            }

            // Appends stats object to data array
            statsData.push(stats);
        }
    }

    // Terminate if data is null
    if (statsData == null || statsData.length <= 0) 
        return;

    // Sets new stats data
    data = statsData;

    // Returns new stats data
    return data;
}

// Display statistics on canvas chart
function showStatistics() {
    // Final data variable
    let data = null;

    // Determines what data to receive based on chart type value
    switch (chartType) {
        case ChartType.Line:
            // Gets min, max and average stats from polls
            data = getPollRateStats(selectedGroup);
            break;
        case ChartType.Bar:
            // Gets influcences stats from polls
            data = getPollInfluncesStats(selectedGroup);
            break;
        default: 
            return;
    }

    // Terminate if data is null
    if (data == null) return;

    // Gets selected dates
    let startDate   = Date.parse(selectedGroup.start_date),
        endDate     = Date.parse(selectedGroup.end_date);

    // Checks whether given input is in correct order
    if (startDate > endDate) data = null;

    // Renders the statistics on a new chart
    renderChart("chart-canvas", data);
}

// Inserts fetched groups to group picker
function insertFetchedGroups() {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Gets the group and chart type picker element
    let groupPicker     = getElement("group-picker"),
        chartTypePicker = getElement("chart-type-picker");

    // Terminate if group picker is null
    if (groupPicker == null || chartTypePicker == null) 
        return;

    // Removes all options in chart type picker
    removeChildren("chart-type-picker");

    // Loops through each group
    for (let i = 0; i < fetchedGroups.length; i++) {
        // Creates a new option element
        let option = createElement("option");
        
        // Sets option value to poll id
        option.innerHTML = option.value = fetchedGroups[i].id;

        // Appends option to user polls picker
        groupPicker.add(option);
    }

    // Adds on change listener to select element
    if (getElement("group-picker").onchange == null)
        addListener("group-picker", () => selectGroup(), "change");

    // Loops through all chart types
    for (let i = 0; i < PollChartTypes.length; i++) {
        // Creates a new option element
        let option = createElement("option");

        // Used to shorten code
        let value = PollChartTypes[i].text;
        
        // Sets option value to poll id
        option.innerHTML = option.value = value;

        // Appends option to user polls picker
        chartTypePicker.add(option);
    }

    // Adds on change listener to select element
    if (getElement("chart-type-picker").onchange == null)
        addListener("chart-type-picker", () => selectChartType(), "change");
}

// Selects a specified group and tampers with values
function selectGroup() {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Gets the group picker element
    let groupPicker = getElement("group-picker");

    // Terminate if picker is null
    if (groupPicker == null) return;

    // Clones group picker variable and converts it to an array
    let options = groupPicker.childNodes;

    // Exit boolean
    let exit = false;

    // Defines group target
    let groupTarget = null;

    // Loops through each element in user polls picker
    options.forEach(function(element) {
        // Checks only for elements with "option" as tag name
        if (element.tagName == "option".toUpperCase()) {
            // Checks whether element is selected or not
            if (element.selected != null && element.selected) {
                /* Loops through each group and checks
                 * whether the selected id exists
                 */
                for (let i = 0; i < fetchedGroups.length; i++) {
                    // Set exit to true if group id was not found
                    if (element.value == fetchedGroups[i].id) {
                        // Sets group target with matched id
                        groupTarget = fetchedGroups[i];

                        // Terminates sub function
                        return;
                    }

                    // Proceed with last step if not found
                    if (i == fetchedGroups.length - 1) {
                        // Set exit to true if group id was not found
                        if (element.value != fetchedGroups[i].id)
                            exit = true;
                    }
                }
            }
        }
    });

    // Skip rendering if exit is true
    if (exit || groupTarget == null) return;

    // Gets new group submitted polls data
    fetchGroupSubmittedPolls(currentUser.token, groupTarget.id);

    // Gets and sets new dates to date pickers
    getGroupStats(groupTarget);

    // Sets selected chart type option
    selectChartType();

    // Re renders the actual chart
    showStatistics();
}

// Gets new dates from chosen group
function getGroupStats(group) {
    // Destorys current chart
    destroyChart();

    // Poll creation date array from start to end
    let pollDates = [];
    
    // Pushes all poll dates to pollDates array
    for (let i = 0; i < group.polls.length; i++) {
        /* Adds date only if iteration is initiated or
         * if previous element value is not equaled to
         * current array element value
         */
        if (i > 0) {
            // Adds date if date is not the same as previous date
            if (group.polls[i].date != group.polls[i - 1].date)
                pollDates.push(group.polls[i].date);

            // Goes to next index
            continue;
        }

        // Pushes date if index is zero
        pollDates.push(group.polls[i].date);
    }

    // Sorts all poll dates accordingly
    pollDates.sort(function(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    });

    // Defines selected poll
    let selectedPoll = selectedGroup.selected_poll;

    // Set default poll if it is null
    if (selectedPoll == null)
        selectedPoll = group.polls[0];
    
    // Creates new selected group object
    selectedGroup = {
        group: group,
        polls: group.polls,
        selected_poll: selectedPoll,
        submitted_polls: groupSubmittedPolls,
        dates: pollDates,
        start_date: pollDates[0],
        end_date: pollDates[pollDates.length - 1]
    };

    // Removes all options from date pickers
    removeChildren("stat-start-date");
    removeChildren("stat-end-date");
    removeChildren("poll-picker");

    // Gets both date pickers
    let startDatePicker = getElement("stat-start-date"),
        endDatePicker   = getElement("stat-end-date"),
        pollPicker      = getElement("poll-picker");

    // Inserts all dates to both date pickers
    for (let i = 0; i < selectedGroup.dates.length; i++) {
        // Creates a new option element
        let startOption = createElement("option"),
            endOption   = createElement("option");
        
        // Sets option value to poll id
        startOption.innerHTML   = selectedGroup.dates[i];
        endOption.innerHTML     = selectedGroup.dates[i]; 

        startOption.value   = startOption.innerHTML;
        endOption.value     = endOption.innerHTML;

        /* Sets start option to selected if iteration is first
         * and sets end option to selected if iteration is last
         */
        if (i == selectedGroup.dates.length - 1)
            endOption.setAttribute("selected", "");
        else if (i == 0)
            startOption.setAttribute("selected", "");

        // Appends option to date pickers
        startDatePicker.add(startOption);
        endDatePicker.add(endOption);      
    }

    // Date picker listener function
    let func = () => selectDates();

    // Adds listeners to date pickers
    if (getElement("stat-start-date").onchange == null)
        addListener("stat-start-date", func, "change");
    if (getElement("stat-end-date").onchange == null)
        addListener("stat-end-date", func, "change");
    
    // Loop through if length is greater than zero
    if (selectedGroup.polls.length > 0) {
        // Loops through each group poll
        for (let i = 0; i < selectedGroup.polls.length; i++) {
            // Creates a new option element
            let option = createElement("option");
            
            // Sets option value to poll title
            option.innerHTML = option.value = selectedGroup.polls[i].title;

            // Appends option to user polls picker
            pollPicker.add(option);
        }
    }

    // Adds on change listener to select element
    if (getElement("poll-picker").onchange == null)
        addListener("poll-picker", () => selectPoll(), "change");
}

// Fetches new values from date pickers and displays new data
function selectDates() {
    // Gets both date pickers
    let startDatePicker = getElement("stat-start-date"),
        endDatePicker   = getElement("stat-end-date");

    // Sets new dates
    selectedGroup.start_date    = startDatePicker.value;
    selectedGroup.end_date      = endDatePicker.value;

    // Shows new statistics with new data
    showStatistics();
}

// Shows poll stats if chart type is bar and not line
function selectPoll() {
    // Defines poll
    let poll = null;

    // Gets poll picker element
    let pollPicker = getElement("poll-picker");

    // Terminates if poll picker element is null
    if (pollPicker == null) return;

    /* Loops through fetched polls and sets poll
     * to selected poll if found with given id
     */
    for (let i = 0; i < selectedGroup.polls.length; i++)
        if (pollPicker.value == selectedGroup.polls[i].id)
            poll = selectedGroup.polls[i];

    // Terminate if poll is null
    if (poll == null) return;

    // Sets selected poll
    selectedGroup.selected_poll = poll;

    // Shows new statistics
    showStatistics();
}

// Selects a chart type depending on option
function selectChartType() {
    // Terminate if current user is not admin or super user
    if (currentUser.super_user != "1" &&
        currentUser.admin != "1") return;

    // Gets the chart type picker element
    let chartTypePicker = getElement("chart-type-picker");

    // Terminate if picker is null
    if (chartTypePicker == null) return;

    // Clones group picker variable and converts it to an array
    let options = chartTypePicker.childNodes;
    
    // Exit boolean
    let exit = false;

    // Loops through each element in user polls picker
    options.forEach(function(element) {
        // Checks only for elements with "option" as tag name
        if (element.tagName == "option".toUpperCase()) {
            // Checks whether element is selected or not
            if (element.selected != null && element.selected) {
                /* Loops through each group and checks
                 * whether the selected id exists
                 */
                for (let i = 0; i < PollChartTypes.length; i++) {
                    // Set exit to true if group id was not found
                    if (element.value == PollChartTypes[i].text) {
                        // Sets group target with matched id
                        chartType = PollChartTypes[i].value;

                        // Terminates sub function
                        return;
                    }

                    // Proceed with last step if not found
                    if (i == PollChartTypes.length - 1) {
                        // Set exit to true if group id was not found
                        if (element.value != PollChartTypes[i].text)
                            exit = true;
                    }
                }
            }
        }
    });

    // Terminate if there is no group or exit is true
    if (exit || selectedGroup.group == null) return;

    // Determines what filter options to show
    switch (chartType) {
        case ChartType.Line:
            // Render date filter container if not visible
            getElement("poll-filter").style.display = "none";
            getElement("date-filter").style.display = "block";
            break;
        case ChartType.Bar:
            // Render date filter container if not visible
            getElement("date-filter").style.display = "none";
            getElement("poll-filter").style.display = "block";
            break;
    }

    // Re renders the actual chart
    showStatistics();
}