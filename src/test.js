'use strict'

/*  */

var Utils = (function () {
  /**
   * Helper functions
   */
  function Utils() {
  }
  
  /**
   * Get a random number from 0 up to (but not including) given value
   * @param { number } value Maximum value
   * @returns { number }
   */
  Utils.getRandomUpTo = function (value) {
    return Math.floor(Math.random() * value)
  }
  
  /**
   * Shuffle array items. Modifies passed in array
   * @param { Array<any> } arr Array to shuffle
   */
  Utils.shuffleArray = function (arr) {
    var j, x, i
    
    for (i = arr.length - 1; i > 0; i--) {
      j = Utils.getRandomUpTo(i + 1)
      x = arr[i]
      arr[i] = arr[j]
      arr[j] = x
    }
  }
  
  return Utils
})()

var utils = Utils

/*  */


var AlphabetLetter = (function () {
  /**
   * Alphabet Letter
   * Represents a letter, a part of Alphabet
   * Requires a correct data object to be passed in
   *
   * @example
   * ```js
   * { letter: 'P', description: 'pe', sentence: 'Tip!' }
   * ```
   *
   * @example
   * ```js
   * { letter: 'P', description: 'pe' }
   * ```
   *
   * @param { number } id ID for current letter
   * @param { ObjectAlphabetLetter } data Letter data as Object
   */
  function AlphabetLetter(id, data) {
    this._id = id
    this._score = data.score || 0
    this._origin = data
    this._letter = data.letter
    this._sentence = data.sentence || ''
    this._description = data.description
    this._transcription = data.transcription || ''
  }
  
  AlphabetLetter.prototype = {
    constructor: AlphabetLetter,
    
    /**
     * Get letter id
     * @returns { number }
     */
    getId: function () {
      return this._id
    },
    
    /**
     * Get letter score
     * @returns { number }
     */
    getScore: function () {
      return this._score
    },
    
    /**
     * Increases score for letter by 1
     */
    addScore: function () {
      this._score++
    },
    
    /**
     * Reduces score for letter by 1
     */
    reduceScore: function () {
      this._score--
    },
    
    /**
     * Get letter
     * @returns { string } Letter
     */
    getLetter: function () {
      return this._letter
    },
    
    /**
     * Get sentence, if was specified in alphabet,
     * "undefined" otherwise
     * @example Letter "ん" is never used in the beginning
     * @returns { string | undefined } Sentence
     */
    getSentence: function () {
      return this._sentence
    },
    
    /**
     * Get description
     * Letter description - usually romanized version of letter
     * @example Description for letter "や" is "ya"
     * @returns { string } Description
     */
    getDescription: function () {
      return this._description
    },
    
    /**
     * Get transcription
     * @returns { string } Transcription
     */
    getTranscription: function () {
      return this._transcription
    },
    
    /**
     * Get object representation of letter
     * @returns { ObjectAlphabetLetter }
     */
    toObject: function () {
      return {
        letter: this._letter,
        description: this._description,
        sentence: this._sentence,
        score: this._score
      }
    }
  }
  
  return AlphabetLetter
})()

var alphabetLetter = AlphabetLetter

/*  */


var AlphabetLetterGroup = (function () {
  /**
   * Alphabet letter group class
   * Takes in and stores array of letters as instances of AlphabetLetter
   * Requires correct array of letters to be passed in
   * @example
   * ```js
   * [
   *   { letter: 'P', description: 'pe' },
   *   { letter: 'P', description: 'pe', sentence: 'tip' }
   *   // ...
   * ]
   * ```
   * @param { number } id ID, what will be given to group
   * @param { Array<ObjectAlphabetLetter> } letters Array of letters should be stored in group
   */
  function AlphabetLetterGroup(
    id,
    letters
  ) {
    this._id = id
    this._letters = []
    this._lettersCount = 0
    
    this._initLetters(letters)
  }
  
  AlphabetLetterGroup.prototype = {
    constructor: AlphabetLetterGroup,
    
    /**
     * Get amount of letters stored in group
     * @returns { number } Amoun of letters stored in group
     */
    size: function () {
      return this._lettersCount
    },
    
    /**
     * Get group id
     * @returns { number } Group id
     */
    getId: function () {
      return this._id
    },
    
    /**
     * Get letter what stores given id
     * @param { number } id Letter id
     * @returns { AlphabetLetter }
     */
    getLetter: function (id) {
      return this._letters[id]
    },
    
    /**
     * Get as array of letter objects
     * @returns { Array<AlphabetLetterGroup> }
     */
    toArray: function () {
      var result = []
      
      for (let i = 0; i < this.size(); i++) {
        result.push(this.getLetter(i).toObject())
      }
      
      return result
    },
    
    /**
     * Creates instance of AlphabetLetter with passed in data
     * @private
     * @param { number } id ID for letter. Will be passed to AlphabetLetter
     * @param { object } letter Letter data
     */
    _addLetter: function (id, letter) {
      this._letters[id] = new alphabetLetter(id, letter)
      this._lettersCount++
    },
    
    /**
     * Creates instances of AlphabetLetter for each letter passed in
     * @private
     */
    _initLetters: function (letters) {
      var lettersCount = letters.length
      for (var i = 0; i < lettersCount; i++) {
        this._addLetter(i, letters[i])
      }
    }
  }
  
  return AlphabetLetterGroup
})()

var alphabetLetterGroup = AlphabetLetterGroup

/*  */


var Alphabet = (function () {
  /**
   * Alphabet class
   * Stores a groups of letters
   * Stores an instance of pronouncing service
   * Accepts an object as an argument with given structure:
   * @example
   * ```js
   * {
   *   name: "Japan",
   *   groups: [
   *     [{
   *       letter: 'す',
   *       description: 'su'
   *     }, {
   *       letter: 'さ',
   *       description: 'sa',
   *       sentence: 'Hello, world!'
   *     }]
   *    ]
   *  }
   * ```
   * @param { ObjectAlphabet } alphabet Correct alphabet object
   */
  function Alphabet(alphabet) {
    this._groups = []
    this._groupsCount = 0
    this._languageName = ''
    
    this._initGroups(alphabet.groups)
  }
  
  Alphabet.prototype = {
    constructor: Alphabet,
    
    /**
     * Returns amount of groups stored in alphabet
     * @returns { number }
     */
    size: function () {
      return this._groupsCount
    },
    
    /**
     * Returns group with given ID
     * @param { number } groupId ID of group
     * @returns { AlphabetLetterGroup | undefined }
     */
    getGroup: function (groupId) {
      return this._groups[groupId]
    },
    
    /**
     * Get object representation of alphabet
     * @returns { ObjectAlphabet }
     */
    toObject: function () {
      var groups = []
      
      for (let i = 0; i < this.size(); i++) {
        groups.push(this.getGroup(i).toArray())
      }
      
      return {
        name: this._languageName,
        groups: groups
      }
    },
    
    /**
     * Creates and stores new group with given ID and letters
     * @private
     * @param { number } groupId Group ID
     * @param { Array<ObjectAlphabetLetter> } letter Letters to put in created group
     */
    _addGroup: function (groupId, letters) {
      this._groups[groupId] = new alphabetLetterGroup(groupId, letters)
      this._groupsCount++
    },
    
    /**
     * Creates and stores instances of AlphabetLetterGroup
     * @private
     * @param { Array<Array<ObjectAlphabetLetter>> } groups List of letter groups
     */
    _initGroups: function (groups) {
      var groupsCount = groups.length
      
      for (var i = 0; i < groupsCount; i++) {
        this._addGroup(i, groups[i])
      }
    }
  }
  
  return Alphabet
})()

var alphabet = Alphabet

/*  */


var PriorityQueue = (function () {
  /**
   * Priority queue implementation
   * `numA >> numB` used for implement integer division
   *
   * Root node is `_nodes[1]`
   * Child of node `i` stores in `2 * i` and `2 * i + 1`
   *
   * @see http://synset.com/ai/ru/data/Queue.html for details
   * @param { Number | undefined } size Queue size
   */
  function PriorityQueue(size) {
    if (!size) {
      size = 1000
    }
    
    this._size = 0
    this._nodes = new Array(size)
    this._comparator = this._defaultComparator
  }
  
  PriorityQueue.prototype = {
    constructor: PriorityQueue,
    
    /**
     * Get size
     * @returns { number }
     */
    size: function () {
      return this._size
    },
    
    /**
     * Add an element to queue
     * @param { * } value Element to be added
     */
    push: function (value) {
      this._nodes[++this._size] = value
      
      for (
        var i = this._size;
        i > 1 && this.compare(this._nodes[i], this._nodes[i >> 1]);
        i = i >> 1
      ) {
        this.swap(i, i >> 1)
      }
    },
    
    /**
     * Check, if a is less than b using
     * Calls a `_comparator`
     * @param { * } a
     * @param { * } b
     * @returns { Boolean }
     */
    compare: function (a, b) {
      return this._comparator(a, b)
    },
    
    /**
     * Takes an element from the queue with minimal value and rebuilds the queue
     * @returns { * }
     */
    shift: function () {
      if (this._size === 0) {
        return
      }
      
      this.swap(1, this._size)
      this.rebuild(1)
      
      return this._nodes[this._size--]
    },
    
    /**
     * Swap in tree i with a
     * @param { * } i
     * @param { * } a
     */
    swap: function (i, j) {
      var a = this._nodes[i]
      
      this._nodes[i] = this._nodes[j]
      this._nodes[j] = a
    },
    
    /**
     * Rebuild the tree
     */
    rebuild: function (node) {
      var lf = 2 * node
      
      if (lf < this._size) {
        var rt = lf + 1
        
        if (rt < this._size && this.compare(this._nodes[rt], this._nodes[lf])) {
          lf = rt
        }
        
        if (this.compare(this._nodes[lf], this._nodes[node])) {
          this.swap(node, lf)
          this.rebuild(lf)
        }
      }
    },
    
    /**
     * Set custom comparator
     * @param { function } comparator
     */
    setComparator: function (comparator) {
      this._comparator = comparator
    },
    
    /**
     * Default comparator. Simply checks if a is less than b
     * @private
     * @param { number } a
     * @param { number } b
     * @returns { Boolean }
     */
    _defaultComparator: function (a, b) {
      return a < b
    }
  }
  
  return PriorityQueue
})()

var priorityQueue = PriorityQueue

/*  */


var Quiz = (function () {
  /**
   * Main alphabet library class (Quiz)
   * Provides functionality for alphabet learning
   */
  function Quiz() {
    /**
     * @var { number } _modes
     * 0 - Letter as question and descriptions as options
     * 1 - Description as question and letters as options
     * 2 - Letter as question and no options (free-type answer)
     */
    this._modes = 2
    this._alphabet = null
    
    this._currentMode = 0
    this._currentGroup = null
    this._currentQuestion = null
    this._currentDatabase = null
    
    this._MIN_SCORE_TO_REMEMBER = 4
    this._MIN_SCORE_TO_ACCEPT_PROGRESS = 6
  }
  
  Quiz.prototype = {
    constructor: Quiz,
    
    /**
     * Initiate quiz and take first question
     * Requires correct alpabets list to be passed in
     * @example
     * ```js
     * new Quiz([{
     *  name: "Japan",
     *  groups: [
     *    [
     *      { letter: "x", description: "descx" }
     *    ],
     *    [
     *      { letter: "y", description: "descy", sentence: "tip" },
     *      { letter: "z", description: "descz" }
     *    ]
     *  ]
     * }])
     * ```
     * @param { ObjectAlphabet } alpabet
     */
    start: function (alphabet$$1) {
      this._initQuestions(alphabet$$1)
      this.next()
    },
    
    /**
     * Take next question
     */
    next: function (answerText) {
      if (this._currentQuestion) {
        if (this.isCorrect(answerText)) {
          this._currentQuestion.addScore()
        } else {
          this._currentQuestion.reduceScore()
        }
      }
      
      this._changeGroup()
      this._changeQuestion()
      this._changeMode()
    },
    
    /**
     * Check, if answer is correct
     * @param { string } answerText
     * @returns { boolean }
     */
    isCorrect: function (answerText) {
      var letter = this._currentQuestion.getLetter().toLowerCase()
      var description = this._currentQuestion.getDescription().toLowerCase()
      var answer = answerText.toLowerCase()
      
      return letter === answer || description === answer
    },
    
    /**
     * Get an array of options
     * Result depends on current mode
     * For mode = 0 or mode = 1 array with objects will be returned
     * For mode = 2 empty array will be returned
     * @example
     * ```js
     * // mode = 0
     * [ { text: 'option text', additional: 'additional option text' }, ]
     * // mode = 1
     * [ { text: 'option text' }, ]
     * // mode = 2
     * []
     * ```
     * @returns { Array<{ text: string, additional?: string }> } Array of options
     */
    getOptions: function () {
      var options = []
      
      // If current mode is 'letter-and-options' or 'description-and-options'
      if (this._currentMode === 0 || this._currentMode === 1) {
        var groupSize = this._currentGroup.size()
        
        for (var i = 0; i < groupSize; i++) {
          var letter = this._currentGroup.getLetter(i)
          var option = {}
          
          if (this._currentMode === 0) {
            option.text = letter.getDescription()
            option.additional = letter.getTranscription()
          } else {
            option.text = letter.getLetter()
          }
          
          options.push(option)
        }
      }
      
      utils.shuffleArray(options)
      
      return options
    },
    
    /**
     * Get message
     * @returns { string } Message text
     */
    getMessage: function () {
      var message = ''
      
      if (!this._answerPossiblyRemembered()) {
        switch (this._currentMode) {
          case 0:
            message = `${this._currentQuestion.getDescription()} (русский)`
            break
          case 1:
            message = this._currentQuestion.getLetter()
            break
        }
      } else {
        switch (this._currentMode) {
          case 0: // Letter as question with options
          case 1: // Description as question with options
            message = 'Select one option'
            break
          case 2: // Letter as question with free-type answer
            message = 'Type your answer and press Enter'
            break
          default:
          // unknown mode;
        }
      }
      
      return message
    },
    
    /**
     * Get sentence
     * @returns { string } Sentence text
     */
    getSentence: function () {
      return this._currentQuestion.getSentence()
    },
    
    /**
     * Get question
     * @returns { string } Question text
     */
    getQuestion: function () {
      var question = {
        text: '',
        original: this._currentQuestion.toObject(),
        remembered: this._answerPossiblyRemembered()
      }
      
      switch (this._currentMode) {
        case 0: // Letter with options
        case 2: // Letter and free-type answer
          question.text = this._currentQuestion.getLetter()
          break
        case 1: // Description with options
          question.text = this._currentQuestion.getDescription()
          break
        default:
        // unknown mode;
      }
      
      return question
    },
    
    /**
     * Returns percent value of learning progress
     * @returns { number }
     */
    getProgress: function () {
      var total = 0
      var progress = 0
      var databaseSize = this._currentDatabase.size()
      
      for (var id = 0; id < databaseSize; id++) {
        var group = this._alphabet.getGroup(id)
        var groupSize = group.size()
        
        for (var ig = 0; ig < groupSize; ig++) {
          if (
            group.getLetter(ig).getScore() > this._MIN_SCORE_TO_ACCEPT_PROGRESS
          ) {
            progress++
          }
          
          total++
        }
      }
      
      var percentage = progress / total * 100
      
      return isNaN(percentage) ? 0 : percentage
    },
    
    /**
     * How many times user have to give a right answer before new
     * letters will be added to quiz
     * @param { number } val
     */
    setMinScoreToRememember: function (val) {
      if (val > 0) {
        this._MIN_SCORE_TO_REMEMBER = val
      }
    },
    
    /**
     * Get current quiz snapshot.
     * Userful for saving the progress
     * @returns { * } Snapshot data
     */
    getSnapshot: function () {
      // return all of the quiz information including alphabet
      return {
        mode: this._currentMode,
        group: this._currentGroup.getId(),
        alphabet: this._alphabet.toObject(),
        question: this._currentQuestion.getId(),
        database: this._currentDatabase.size(),
        minScoreToRemember: this._MIN_SCORE_TO_REMEMBER,
        minScoreToAcceptProgress: this._MIN_SCORE_TO_ACCEPT_PROGRESS
      }
    },
    
    /**
     * Load quiz state saved using `getSnapshot` method
     * Restores progress, last question, score, etc
     * @param { * } snapshot Snapshot data
     */
    useSnapshot: function (snapshot) {
      // It adds group with id = 0 initially
      this._initQuestions(snapshot.alphabet)
      
      // But we have to add remaining groups manually
      for (var i = 1; i < snapshot.database; i++) {
        this._currentDatabase.push(this._alphabet.getGroup(i))
      }
      
      this._currentMode = snapshot.mode
      this._currentGroup = this._alphabet.getGroup(snapshot.group)
      this._currentQuestion = this._currentGroup.getLetter(snapshot.question)
      this._MIN_SCORE_TO_REMEMBER = snapshot.minScoreToRemember
      this._MIN_SCORE_TO_ACCEPT_PROGRESS = snapshot.minScoreToAcceptProgress
    },
    
    /**
     * Init question list
     * Creates new instance of alphabet and initiates current database
     * @param { ObjectAlphabet } alpabet
     * @private
     */
    _initQuestions: function (alpabet) {
      this._alphabet = new alphabet(alpabet)
      this._currentDatabase = new priorityQueue(this._alphabet.size())
      this._currentDatabase.setComparator(function (
        groupA,
        groupB
      ) {
        var aScore = 0
        var bScore = 0
        var aSize = groupA.size()
        var bSize = groupB.size()
        var size = Math.min(aSize, bSize)
        
        for (var i = 0; i < size; i++) {
          aScore += groupA.getLetter(i).getScore()
          bScore += groupB.getLetter(i).getScore()
        }
        
        return aScore < bScore
      })
      
      this._currentDatabase.push(this._alphabet.getGroup(0))
    },
    
    /**
     * Changes current mode to random one
     * If previous mode was `2`, then `0` will be used, or random mode otherwise
     * @private
     */
    _changeMode: function () {
      if (this._currentQuestion && this._answerPossiblyRemembered()) {
        if (this._currentMode === 2) {
          this._currentMode = 0
        } else {
          this._currentMode = utils.getRandomUpTo(this._modes + 1)
        }
      } else {
        this._currentMode = 0
      }
    },
    
    /**
     * Change current questions group
     * Takes random one from two groups from database with lowest score
     * and saves to `_currentGroup`
     * @private
     */
    _changeGroup: function () {
      // Save modifications for current group if exists
      if (this._currentGroup) {
        this._currentDatabase.push(this._currentGroup)
      }
      
      // Get last X groups with lowest score
      var lowestScoreGroup
      var groups = []
      var x = 2
      
      for (var i = 0; i < x; i++) {
        var groupWithLowestScore = this._currentDatabase.shift()
        
        if (groupWithLowestScore) {
          groups.push(groupWithLowestScore)
        }
        
        if (!lowestScoreGroup) {
          lowestScoreGroup = groupWithLowestScore
        }
      }
      
      // Shuffle groups array and use first one group from result as a
      // current group
      utils.shuffleArray(groups)
      this._currentGroup = groups.shift()
      
      // Put back in queue remaining groups
      var restGroupsSize = groups.length
      
      for (var xi = 0; xi < restGroupsSize; xi++) {
        this._currentDatabase.push(groups[xi])
      }
      
      // We would to increase difficulty if group with lowest score have
      // score `>= _MIN_SCORE_TO_REMEMBER`
      this._increaseDifficultyIfNeeded(lowestScoreGroup)
    },
    
    /**
     * Change current question
     * Takes one random letter from `_currentGroup` and saves to
     * `_currentQuestion`
     * @private
     */
    _changeQuestion: function () {
      this._currentQuestion = this._currentGroup.getLetter(
        utils.getRandomUpTo(this._currentGroup.size())
      )
    },
    
    /**
     * If score of group with lowest score is high enough (depends on
     * `_MIN_SCORE_TO_REMEMBER` value), next group will be added to the
     * `_currentDatabase`
     * @private
     * @param { AlphabetLetterGroup } groupWithLowestScore Letter group
     */
    _increaseDifficultyIfNeeded: function (
      groupWithLowestScore
    ) {
      var groupSize = groupWithLowestScore.size()
      
      for (var i = 0; i < groupSize; i++) {
        if (
          groupWithLowestScore.getLetter(i).getScore() <
          this._MIN_SCORE_TO_REMEMBER
        ) {
          return
        }
      }
      
      this._currentDatabase.push(
        this._alphabet.getGroup(this._currentDatabase.size())
      )
    },
    
    /**
     * Check, if answer for current question is possibly remembered.
     * Result based on comparing of letter score with _MIN_SCORE_TO_REMEMBER
     * @private
     * @returns { boolean }
     */
    _answerPossiblyRemembered: function () {
      return this._currentQuestion.getScore() > this._MIN_SCORE_TO_REMEMBER
    }
  }
  
  return Quiz
})()

export default Quiz
