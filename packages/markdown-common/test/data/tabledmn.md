| #dmn:input Season season string | #dmn:input "How many guests" guestCount integer | #dmn:output Dish desiredDish string | 
| --- | --- | --- |
| "Fall" | <= 8 | "Spareribs" |
| "Winter" | <= 8 | "Roastbeef" |
| "Spring" | <= 4 | "Dry Aged Gourmet Steak" |
| "Spring" | [5..8] | "Steak" |
| "Fall","Winter","Summer" | > 8 | "Spareribs" |
| "Summer" | | "Light Salad and a nice Steak" |
