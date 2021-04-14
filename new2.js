let puppeteer = require('puppeteer');
let fs = require('fs');
let path = require('path');
const name ="Mom";
let links = process.argv[2];
let allLinks = fs.readFileSync(links, "utf-8");
let listLink = JSON.parse(allLinks);

let allMsgs = require("./allMsgs.json");
const { networkInterfaces } = require('os');

//let quotes = require("./quotes.json");


(async function () {

    let wLink = listLink.whatsappLink;

    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized", "--disable-notifications"]
    });

    let tabs = await browser.pages();
    let tab = tabs[0];

    await tab.goto(wLink, {
        waitUntil: "networkidle2"
    });



    await tab.waitForSelector("._2_1wd.copyable-text.selectable-text");
    await tab.type("._2_1wd.copyable-text.selectable-text",name);
    await tab.keyboard.press('Enter');

    let welcomeMsg = allMsgs.firstMsg;
    await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });
    await tab.type("#main div.selectable-text[contenteditable]", welcomeMsg);
    await tab.keyboard.press('Enter');

    await getReply(tab, browser);

    // console.log(reply);


})();

async function getReply(tab, browser) {

    let text = await tab.evaluate(() => Array.from(document.querySelectorAll(".copyable-text span"), element => element.textContent));
    let reply = text[text.length - 2];
    if (reply.localeCompare("start") == 0 || reply.localeCompare("Start") == 0) {
        await letsBegin(tab, browser);
    }
    else {
        setTimeout(getReply(tab, browser), 10000);
    }
}

async function letsBegin(tab, browser) {
    let Msg = allMsgs.start;

    await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });
    let msg = Msg.split('\n');
    for (let i = 0; i < msg.length; i++) {
        await tab.type("#main div.selectable-text[contenteditable]", msg[i], { delay: 20 });

        await tab.keyboard.down('Shift');
        await tab.keyboard.press('Enter');
        await tab.keyboard.up('Shift');
    }
    await tab.keyboard.press("Enter");

    await getRequest(tab, browser);

}

async function getRequest(tab,browser)
 {
    let text = await tab.evaluate(() => Array.from(document.querySelectorAll(".copyable-text"), element => element.textContent));
    let reply = text[text.length - 2];
    if(reply.localeCompare("1")==0)
    {
        let newsLink=listLink.newsLink;
        let newTab=await browser.newPage();
        await newTab.goto(newsLink,{
            waitUntil:'networkidle2'
        });

        await delay(3000);
    
        await getNews(tab,browser,newTab);//get 5 headlines and their links 
       
        setTimeout( await letsBegin(tab, browser), 3000);
       

    }
    else if (reply.localeCompare("2")==0)
    {
       let wlink =listLink.weatherUpdate;
       let newTab=await browser.newPage();
       await newTab.goto(wlink,{
        waitUntil:'networkidle2'
    });
        let High = "21/";
        let Low = "6";


        let temperature = High + Low;
        let innertext = " Briight sunshine Day. ";
        innertext = innertext.toLowerCase();

        console.log("LINE 114");

        let final = "Weather Update, It will be a " + innertext.slice(3) + "Temperature for the day is " +  High + Low;


        newTab.close();


        await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });

        final = final.split("\n");
        
        await tab.type("#main div.selectable-text[contenteditable]", final, { delay: 20 });

        await tab.keyboard.down("Shift");
        await tab.keyboard.press("Enter");
        await tab.keyboard.up("Shift");
        
        await tab.keyboard.press("Enter");

        //setTimeout(await start(tab, browser), 3000);

   // await getWeatherForecast(tab,newTab,browser);
    setTimeout(await letsBegin(tab, browser), 3000);
    }

    else if(reply.localeCompare("3")==0)//horoscope
    {
        await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });
        await tab.type("#main div.selectable-text[contenteditable]", "Enter your sunshine ");
        await tab.keyboard.press("Enter");

       
        await delay(10000);
        await getHorroscope(tab, browser);

        //setTimeout(await letsBegin(tab, browser), 3000);
       
        await delay(3000);
        await letsBegin(tab,browser);
    }
 else if (reply.localeCompare("4") == 0) {
    let exit = allMsgs.quit;
    await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });
    await tab.type("#main div.selectable-text[contenteditable]", exit, { delay: 100 });
    await tab.keyboard.press("Enter");
    await tab.close();
    console.log("Make new Setup to start again");
}
else 
 {
    setTimeout(getRequest(tab, browser), 10000);
 }
}

async function getNews(tab,browser,newTab){
    let results = await newTab.evaluate(() => {
        const Headlines = document.querySelectorAll(".Item-headline a", { waitUntil: 'networkidle2' });
        return Array.from(Headlines)
            .slice(0, 5)
            .map(title => {
                let res = {
                    title: title.textContent,
                    link: title["href"]
                };

                return res;

            });
    });
    fs.writeFileSync(path.join(__dirname, "newsItem.json"), JSON.stringify(results));
    newTab.close();
    let newsFile = require('./newsItem.json');
    for (let i = 0; i < 5; i++) {
        let headLine = newsFile[i].title;
        let headLink = newsFile[i].link;

        await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });
        await tab.type("#main div.selectable-text[contenteditable]", headLine);
        await tab.keyboard.down("Shift");
        await tab.keyboard.press("Enter");
        await tab.keyboard.up("Shift");

        await tab.type("#main div.selectable-text[contenteditable]", headLink);
        await tab.keyboard.down("Shift");
        await tab.keyboard.press("Enter");
        await tab.keyboard.up("Shift");

    }
    await tab.keyboard.press("Enter");
}



async function getHorroscope(tab,browser)
{
            
    
//console.log("_____________________________")
    let link = listLink.horoscope;
    let newTab=await browser.newPage();
    await newTab.goto(link,{waitUntil:"networkidle2"});
    let text = await tab.evaluate(() => Array.from(document.querySelectorAll(".copyable-text span"), element => element.textContent));
    let reply = text[text.length - 2];
        
    await delay(1000);
    if (reply.localeCompare("Aries")==0 || reply.localeCompare("aries")==0 || reply.localeCompare("Taurus")==0 || reply.localeCompare("taurus")==0 || reply.localeCompare("Gemini")==0 || reply.localeCompare("gemini")==0 || reply.localeCompare("Pisces")==0 || reply.localeCompare("pisces")==0 || reply.localeCompare("Aquarius")==0 || reply.localeCompare("aquarius")==0 || reply.localeCompare("Capricorn")==0 || reply.localeCompare("capricorn")==0 || reply.localeCompare("Sagittarius")==0 || reply.localeCompare("sagittarius")==0 || reply.localeCompare("Scorpio") || reply.localeCompare("scorpio") || reply.localeCompare("leo") || reply.localeCompare("Leo") || reply.localeCompare("cancer") || reply.localeCompare("Cancer") || reply.localeCompare("virgo") || reply.localeCompare("Virgo") || reply.localeCompare("libra") || reply.localeCompare("Libra")) {

        let newTab = await browser.newPage();
        link = path.join(link, reply,"/");

        await newTab.goto(link, {
            waitUntil: "networkidle2"
        });

        let info = await newTab.$$('.margin-top-xs-0', { visible : true});

        let horroscopeInfo = await newTab.evaluate( function (element){
            return element.textContent;
           // return fullText;
        }, info[0]);

        await newTab.close();

        await tab.waitForSelector("#main div.selectable-text[contenteditable]", { visible: true });
        await tab.type("#main div.selectable-text[contenteditable]", horroscopeInfo);
        await tab.keyboard.press('Enter');
        await delay(1000);

    }
    else {
        setTimeout(getHorroscope(tab, browser), 10000);
    }

}
async function navigationHelper(tab, selector) {
    await Promise.all([tab.waitForNavigation({
        waitUntil: "networkidle2"
    }), tab.click(selector)]);
}



function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
