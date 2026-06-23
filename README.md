#

## notes

### ways to make board

#### width^2 divs

column = mod width
row = ? think later

#### 2d array

### move snake

each cell is 7x7 in tailwind units (width: calc(var(--spacing) _ 7) /_ 1.75rem = 28px \*/;)

snake is 5x5 in tailwind units (height: calc(var(--spacing) _ 5) /_ 1.25rem = 20px \*/;)

if start in 0 0 to move to next cell, move left by 28 px (7 with tailwind)

so col 3 would be left-14 and col 8 would be left-49 ( 196px )

actualy now that think abouit. tailwind no work becuase probably move with js so just move by 20 px.

wory accesibility later.

### generatl

when snake get bigger body get bigger so join body

#### idea

head when alone 5x5
body 7x5
first body + 1 to fill gap of head

or

not make body individual, instead make body whole width untill end of body
