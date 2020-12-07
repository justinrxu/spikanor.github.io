// Justin Xu
(function () {
  "use strict";

  window.addEventListener("load", init);

  const METRICS_LIST = {
    "Daily": {
      "Positive Cases": function (data) {return data["positiveIncrease"];},
      "Positive Frequency": function (data) {return division(data["positiveIncrease"],
      data["positiveIncrease"] + data["negativeIncrease"]);},
      "Test Results": function (data) {return data["totalTestResultsIncrease"];},
      "Deaths": function (data) {return data["deathIncrease"];}
    },
    "Total": {
      "Positive Cases": function(data) {return data["positive"];},
      "Positive Frequency": function (data) {return division(data["positive"],
      data["positive"] + data["negative"]);},
      "Test Results": function (data) {return data["totalTestResults"];},
      "Deaths": function (data) {return data["death"];}
    },
    "Hospital Status": {
      "Hospitalized Increase": function (data) {return data["hospitalizedIncrease"];},
      "Hospitalized Currently": function (data) {return isNULL(data["hospitalizedCurrently"]);},
      "Hospitalized Cumulative": function (data) {return isNULL(data["hospitalizedCumulative"]);},
      "ICU Currently": function (data) {return isNULL(data["inIcuCurrently"]);},
      "ICU Cumulative": function (data) {return isNULL(data["inIcuCurrently"]);},
      "On Ventilator Currently": function (data) {return isNULL(data["onVentilatorCurrently"]);},
      "On Ventilator Cumulative": function (data) {return isNULL(data["onVentilatorCumulative"]);}
    }
  }
  // Data only pulled from covidtracking right now.
  const URL = "https://api.covidtracking.com/v1/states/current.json";
  const STATES = 56;

  let list_data = [], rankings_order = [], metrics_list = [];

  let rankings_ul, metrics_div;

  function init() {
    rankings_ul = document.getElementById("rankings");
    metrics_div = document.getElementById("metrics");
    createMetricsLists();

    get(URL, initializeStateList);
  }

  function sortByMetric(metric) {
    rankings_order.sort(function (a, b) {
      return metric(list_data[b.id]) - metric(list_data[a.id]);
    });
    while(rankings_ul.firstChild) {
      rankings_ul.removeChild(rankings_ul.firstChild);
    }
    rankings_order.forEach(function (entry) {
      rankings_ul.appendChild(entry);
      displayMetric(entry, metric);
    });
  }

  function displayMetric(state, metric) {
    state.innerText = state.id + " " + metric(list_data[state.id]);
  }

  function initializeStateList(response) {
    let data = response.splice(0, STATES);
    data.forEach(function (entry) {
      list_data[entry["state"]] = entry;
      rankings_order.push(createStateElement(entry));
    });
    setTimeout(function () {sortByMetric(METRICS_LIST["Daily"]["Positive Cases"])}, 100);
    document.getElementById("current-metric").innerText = "Daily: Positive Cases";
  }

  function createStateElement(data) {
    let state = document.createElement("li");
    state.id = data["state"];
    return state;
  }

  function createMetricsLists() {
    for (var type in METRICS_LIST) {
      let dropdown = document.createElement("div");
      dropdown.classList.add("dropdown");
      let dropbtn = document.createElement("button");
      dropbtn.classList.add("dropbtn");
      dropbtn.innerText = type;
      dropdown.appendChild(dropbtn);
      let dropdown_content = document.createElement("div");
      dropdown_content.id = type;
      dropdown_content.classList.add("dropdown-content");
      for (var metric in METRICS_LIST[type]) {
        let metric_select = document.createElement("a");
        metric_select.id = metric;
        metric_select.innerText = metric;
        metric_select.addEventListener("click", function() {
          document.getElementById("current-metric").innerText = this.parentNode.id + ": " + this.id;
          sortByMetric(METRICS_LIST[this.parentNode.id][this.id]);
        });
        dropdown_content.appendChild(metric_select);
      }
      dropdown.appendChild(dropdown_content)
      metrics_div.appendChild(dropdown);
    }
  }


  // HELPERS

  function division(dividend, divisor) {
    return (divisor) ? (dividend / divisor) : 0;
  }

  function isNULL(value) {
    return (value != null) ? value : 0;
  }

  /**
   * Makes a get request to input url, then executes input function
   * @param {String} url - url to get from
   * @param {function()} func - function to execute with response
   */
  function get(url, func) {
    console.log("Fetching from " + url);
    handleResponse(url, func);
  }

  /**
   * Fetches data from input url then executes input function with fetched data
   * @param {Promise} response - Promise to handle
   */
  function handleResponse(url, func) {
    fetch(url)
      .then(checkStatus)
      .then(parseJSON)
      .then(func)
      .catch(console.log);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {Promise} fetchResponse - response to check for success/error
   * @returns {Promise} - valid result text if response was successful, otherwise rejected
   *                     Promise result
   */
  function checkStatus(fetchResponse) {
    if (fetchResponse.status >= 200 && fetchResponse.status < 300 || fetchResponse.status === 0) {
      return fetchResponse.text();
    } else {
      return Promise.reject(new Error(fetchResponse.status + ": " + fetchResponse.statusText));
    }
  }

  /**
   * Parses Promise data if it is JSON format, doesnt do anything otherwise
   * @param {Promise} response - Response containing data from fetch
   * @returns {Promise} - JSON parsed Promise or originally inputted Promise
   */
   function parseJSON(response) {
     try {
       return JSON.parse(response);
     }
     catch (err) {
       return response;
     }
   }
}) ();
