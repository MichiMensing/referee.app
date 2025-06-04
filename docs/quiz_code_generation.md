# Quiz Code Generation

To allow sharing of quizzes without server persistence the quiz settings will be encoded as a string that can be shared with others. 

## Compression Algorithm

The quiz settings will be encoded as follows:

```
CODE = $ + <version_number> + $ + <settings_code> + $ + <question_code>
```

Since the code should be sharable as a URL encoding is limited to URL safe characters.
The code contains a version reference, reference for quiz settings and questions selected.

*Example*
```
CODE = $1$10305$Yd5hjMZtHZ8lv4aJdL1lpP-tl
```

### Encoding Version

The quiz code generation will be versioned to be able to handle future changes to quiz settings and question sets. The version will be encoded using the same encoding table as used for questions.

*Example* 
```
// version 1
CODE = 1

// version 49
CODE = N
```



### Encoding Quiz Settings
```
CODE = <instantFeedback_1char> + <maxQuestions_3char> + <time_limit_1char>
```

| Setting | state | code |
|-|-|-|
|instantFeedback|false|0|
|instantFeedback|true|1|
|maxQuestions|<number>|<3-digit number>|
|timeLimit|1 min|0|
|timeLimit|5 min|1|
|timeLimit|15 min|2|
|timeLimit|30 min|3|
|timeLimit|45 min|4|
|timeLimit|1 hour|5|

*Example*
```
// instant feedback, max 30 questions, 1 hour
CODE = 10305 
```

### Encoding Questions

All questions have a unique identifier (i.e 1.7). All question identifiers will be sorted alphabetically and each identifier will be replaced with `0` if unselected and `1` if selected.

*Example*
```
QUESTIONS = "001111101100101000100010110010000011101111101110110101101111000100101010111110001000010100101101101100111101100000101010100110110011011111101110101010"
```

In the next step the string will be encoded using the below table by reading 6 bits at a time as binary code.

```
QUESTIONS = "Yd5hjMZtHZ8lv4aJdL1lpP-tl"
```

|index| code | bin |
|-|-|-|
|0|0|000000|
|1|1|000001|
|2|2|000010|
|3|3|000011|
|4|4|000100|
|5|5|000101|
|6|6|000110|
|7|7|000111|
|8|8|001000|
|9|9|001001|
|10|a|001010|
|11|b|001011|
|12|c|001100|
|13|d|001101|
|14|e|001110|
|15|f|001111|
|16|g|010000|
|17|h|010001|
|18|i|010010|
|19|j|010011|
|20|k|010100|
|21|l|010101|
|22|m|010110|
|23|n|010111|
|24|o|011000|
|25|p|011001|
|26|q|011010|
|27|r|011011|
|28|s|011100|
|29|t|011101|
|30|u|011110|
|31|v|011111|
|32|w|100000|
|33|x|100001|
|34|y|100010|
|35|z|100011|
|36|A|100100|
|37|B|100101|
|38|C|100110|
|39|D|100111|
|40|E|101000|
|41|F|101001|
|42|G|101010|
|43|H|101011|
|44|I|101100|
|45|J|101101|
|46|K|101110|
|47|L|101111|
|48|M|110000|
|49|N|110001|
|50|O|110010|
|51|P|110011|
|52|Q|110100|
|53|R|110101|
|54|S|110110|
|55|T|110111|
|56|U|111000|
|57|V|111001|
|58|W|111010|
|59|X|111011|
|60|Y|111100|
|61|Z|111101|
|62|-|111110|
|63|_|111111|
