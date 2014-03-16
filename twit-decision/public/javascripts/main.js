/*global ko */
function ViewModel() {
    'use strict';

    var self = this,
    // constants
        ERROR_TITLE = 'Error processing choices',
        SUCCESS_TITLE = 'Decision Results',
        RESULTS_START_HTML = 'and the winner is ... <strong>',
        RESULTS_END_HTML = '</strong> ... with a score of ',
        choices = [];

    // utility
    function getError (key) {
        return (key && self.errors[key]) || self.errors.unknownError;
    }

    self.errors = {
        'sameInputError': 'Both choices are the same. Try again.', 
        'requiredInputsError': 'You must enter a value for both choices.',
        'unknownError': 'An unknown error occurred.'
    };

    // on screen text
    self.error = ko.observable('');
    self.results = ko.observable('');
    self.messageTitle = ko.observable('');
    
    // visual control
    self.isProcessing = ko.observable(false);
    self.hasResults = ko.observable(false);
    self.shouldShowMessages = ko.computed(function(){
        var returnValue = false;

        if (!self.isProcessing() && (self.hasResults() || self.error() > '')) {
            returnValue = true;
        }

        return returnValue;
    });
    self.messageType = ko.computed(function(){
        var returnValue = 'danger';

        self.messageTitle(ERROR_TITLE);
        if (self.hasResults()) {
            returnValue = 'success';
            self.messageTitle(SUCCESS_TITLE);
        }

        return returnValue;
    });
    
    // try again
    self.tryAgain = function(){
        self.error('');
        self.isProcessing(false);
        self.hasResults(false);
        self.results('');
        self.inputOne('');
        self.inputTwo('');
    };
    
    // form
    self.inputOne = ko.observable();
    self.inputTwo = ko.observable();
    self.formSubmit = function(){
        // some error handling
        if(!self.inputOne() || !self.inputTwo()){
            self.error(getError('requiredInputsError'));
        } else if(self.inputOne() === self.inputTwo()) {
            self.error(getError('sameInputError'));
        } else {
            choices.push(self.inputOne());
            choices.push(self.inputTwo());
            getDecision();
            self.error('');
            self.isProcessing(true);
        }
    };
    
    // posting
    function getDecision(){     
        // send values to server side for processing, wait for callback, getting AJAXy
        $.post('/search', { 'choices': JSON.stringify(choices) }, function(data) {
            choices.length = 0;
            var results = JSON.parse(data);
            
            self.results(RESULTS_START_HTML + results.choice + RESULTS_END_HTML + results.score);
            self.hasResults(true);
            self.isProcessing(false);
        });  
    }
}

ko.applyBindings(new ViewModel());