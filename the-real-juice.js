// You can run this sucka with a smooth `node the-real-juice.js`
// Or just open the pen at https://codepen.io/cedw032/pen/MWjXKmG?editors=0012

// The idea is that named parameters are cool.
// So I guess we do that with destructuring if we wanna be all vanilla 
// about it (maybe not vanilla classic) 

// Let's write the most basic log function we can and name it log.
let {log} = console;
log(`
    We have a function that we can use that will log now :)
    This is totally unnecessary, but I just wanted to point out how little code it takes to create an abstraction
`)

// Cool... Cool, but we want the named parameters, 
log = ({message}) => console.log(message)
// That should do it.

// Let's try it.
log({message: `
    I had to be named message to be printed.
    That's quite cool because if you were looking at
    this function being called for the first time...
    You'd see that this string was going to be in the message.
`})
// Kinda nice I guess.  We're writing for the reader, right?

// Would probably be cooler with some more parameters
// Let's take a named level parameter that we will only print if js decides it is greater than zero
log = ({message, level}) => level > 0 && console.log(message)


// And we can just make something to test it with.
let testIt = () => {
    // Every time we run this test, the current log method will be used.
    // scope flexing like a thug...
    log({
        message: `You're not going to see much of this line`,
        level: 0,
    })

    log({
        message: `This is gonna print most of the time`,
        level: 1, 
    })

    log({
        message: `This isn't even my final form`,
        level: 2, // We're totally a fan of the trailing comma here because clean diffs are the best diffs
    })

    log({
        message: `No one ever goes above level 3 obviously...`,
        level: 3, 
    })
}
// then test it
log({
    message: `
        We're gonna run the test!!
    `,
    level: 99,
})
testIt()

// So if that worked only the level 0 log message should have been skipped

// Ok let's set the logger up so we can adjust the lowest log level at startup. 
// we basically want to be able to make a log method that already knows what level of message to log at.
// So we will write a function to do that.
const makeLog = ({lowestLevelToPrint}) => 
    ({message, level}) => level >= lowestLevelToPrint && console.log(message)
// If there's anything worth copying and pasting from this file, it's the line above.
// Chuck it in a file and wack an export in front of it though please...

// Let's take it for a spin
log({
    message: `
        This message is level 99 so it will always print. We're gonna set
        the lowest log level to zero, we're still using our old logger here.
    `, 
    level: 99,
})
log = makeLog({lowestLevelToPrint: 0})
testIt(); // Every test case should print

log({
    message: `
        Sweet, so everything should have printed, now we are expecting to see the
        level zero line get skipped as we set our lowest level to 1
    `,
    level: 99,
})
log = makeLog({lowestLevelToPrint: 1})
testIt() // Fewer cases

log({
    message: `
        Level 2, does it look right?
    `,
    level: 99,
})
log = makeLog({lowestLevelToPrint: 2})
testIt() // Fewer cases

log({
    message: `
        Level 3 (brrrr...)
    `,
    level: 99,
})
log = makeLog({lowestLevelToPrint: 3})
testIt() // You get the idea

log({
    message: `
        Level 4.  In space, no one can here you scream
    `,
    level: 99,
})
log = makeLog({lowestLevelToPrint: 4})
testIt()

log({
    level: 9001,
    message: `


        Please like and subscribe: https://www.linkedin.com/in/chad-edwards-a7834950/

        I'm keen to write more of this stuff.
        Fire me a message at chad.edwards.mail@gmail if you have some ideas.
        Peace, and don't forget to write your tests :)




        for reference here is our final log maker:

const makeLog = ${makeLog}
    `,
})