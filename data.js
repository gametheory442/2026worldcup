// =============================================================
// data.js — Static tournament data for 2026 FIFA World Cup
// All 48 teams, 12 groups, 104 matches
// UPDATE: Replace TBD placeholders after March 31 playoff finals
// =============================================================

export const TOURNAMENT_DATA = {

  teams: {
    "Mexico":                    { group: "A", flag: "🇲🇽", confederation: "CONCACAF", pot: 1, host: true },
    "South Africa":              { group: "A", flag: "🇿🇦", confederation: "CAF" },
    "South Korea":               { group: "A", flag: "🇰🇷", confederation: "AFC" },
    "UEFA Path D":               { group: "A", flag: "🏳️",  confederation: "UEFA", tbd: true, tbdFinal: "Czechia vs Denmark" },

    "Canada":                    { group: "B", flag: "🇨🇦", confederation: "CONCACAF", pot: 1, host: true },
    "UEFA Path A":               { group: "B", flag: "🏳️",  confederation: "UEFA", tbd: true, tbdFinal: "Bosnia & Herz. vs Italy" },
    "Qatar":                     { group: "B", flag: "🇶🇦", confederation: "AFC" },
    "Switzerland":               { group: "B", flag: "🇨🇭", confederation: "UEFA" },

    "Brazil":                    { group: "C", flag: "🇧🇷", confederation: "CONMEBOL", pot: 1 },
    "Morocco":                   { group: "C", flag: "🇲🇦", confederation: "CAF" },
    "Haiti":                     { group: "C", flag: "🇭🇹", confederation: "CONCACAF" },
    "Scotland":                  { group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "UEFA" },

    "United States":             { group: "D", flag: "🇺🇸", confederation: "CONCACAF", pot: 1, host: true },
    "Paraguay":                  { group: "D", flag: "🇵🇾", confederation: "CONMEBOL" },
    "Australia":                 { group: "D", flag: "🇦🇺", confederation: "AFC" },
    "UEFA Path C":               { group: "D", flag: "🏳️",  confederation: "UEFA", tbd: true, tbdFinal: "Kosovo vs Türkiye" },

    "Germany":                   { group: "E", flag: "🇩🇪", confederation: "UEFA", pot: 1 },
    "Ivory Coast":               { group: "E", flag: "🇨🇮", confederation: "CAF" },
    "Ecuador":                   { group: "E", flag: "🇪🇨", confederation: "CONMEBOL" },
    "Curaçao":                   { group: "E", flag: "🇨🇼", confederation: "CONCACAF", debut: true },

    "Netherlands":               { group: "F", flag: "🇳🇱", confederation: "UEFA", pot: 1 },
    "Japan":                     { group: "F", flag: "🇯🇵", confederation: "AFC" },
    "UEFA Path B":               { group: "F", flag: "🏳️",  confederation: "UEFA", tbd: true, tbdFinal: "Sweden vs Poland" },
    "Tunisia":                   { group: "F", flag: "🇹🇳", confederation: "CAF" },

    "Belgium":                   { group: "G", flag: "🇧🇪", confederation: "UEFA", pot: 1 },
    "Egypt":                     { group: "G", flag: "🇪🇬", confederation: "CAF" },
    "Iran":                      { group: "G", flag: "🇮🇷", confederation: "AFC" },
    "New Zealand":               { group: "G", flag: "🇳🇿", confederation: "OFC" },

    "Spain":                     { group: "H", flag: "🇪🇸", confederation: "UEFA", pot: 1, fifaRank: 1 },
    "Saudi Arabia":              { group: "H", flag: "🇸🇦", confederation: "AFC" },
    "Uruguay":                   { group: "H", flag: "🇺🇾", confederation: "CONMEBOL" },
    "Cape Verde":                { group: "H", flag: "🇨🇻", confederation: "CAF", debut: true },

    "France":                    { group: "I", flag: "🇫🇷", confederation: "UEFA", pot: 1 },
    "Senegal":                   { group: "I", flag: "🇸🇳", confederation: "CAF" },
    "Norway":                    { group: "I", flag: "🇳🇴", confederation: "UEFA" },
    "Intercontinental Path 2":   { group: "I", flag: "🏳️",  confederation: "Intercontinental", tbd: true, tbdFinal: "Bolivia vs Iraq" },

    "Argentina":                 { group: "J", flag: "🇦🇷", confederation: "CONMEBOL", pot: 1, defending: true },
    "Algeria":                   { group: "J", flag: "🇩🇿", confederation: "CAF" },
    "Austria":                   { group: "J", flag: "🇦🇹", confederation: "UEFA" },
    "Jordan":                    { group: "J", flag: "🇯🇴", confederation: "AFC", debut: true },

    "Portugal":                  { group: "K", flag: "🇵🇹", confederation: "UEFA", pot: 1 },
    "Uzbekistan":                { group: "K", flag: "🇺🇿", confederation: "AFC", debut: true },
    "Colombia":                  { group: "K", flag: "🇨🇴", confederation: "CONMEBOL" },
    "Intercontinental Path 1":   { group: "K", flag: "🏳️",  confederation: "Intercontinental", tbd: true, tbdFinal: "Jamaica vs DR Congo" },

    "England":                   { group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA", pot: 1 },
    "Croatia":                   { group: "L", flag: "🇭🇷", confederation: "UEFA" },
    "Ghana":                     { group: "L", flag: "🇬🇭", confederation: "CAF" },
    "Panama":                    { group: "L", flag: "🇵🇦", confederation: "CONCACAF" },
  },

  groups: {
    A: { teams: ["Mexico", "South Africa", "South Korea", "UEFA Path D"] },
    B: { teams: ["Canada", "UEFA Path A", "Qatar", "Switzerland"] },
    C: { teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
    D: { teams: ["United States", "Paraguay", "Australia", "UEFA Path C"] },
    E: { teams: ["Germany", "Ivory Coast", "Ecuador", "Curaçao"] },
    F: { teams: ["Netherlands", "Japan", "UEFA Path B", "Tunisia"] },
    G: { teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
    H: { teams: ["Spain", "Saudi Arabia", "Uruguay", "Cape Verde"] },
    I: { teams: ["France", "Senegal", "Norway", "Intercontinental Path 2"] },
    J: { teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
    K: { teams: ["Portugal", "Uzbekistan", "Colombia", "Intercontinental Path 1"] },
    L: { teams: ["England", "Croatia", "Ghana", "Panama"] },
  },

  venues: {
    "Mexico City":     { country: "Mexico", stadium: "Estadio Azteca",              capacity: 83000 },
    "Zapopan":         { country: "Mexico", stadium: "Estadio Akron",               capacity: 49850 },
    "Monterrey":       { country: "Mexico", stadium: "Estadio BBVA",                capacity: 53500 },
    "Toronto":         { country: "Canada", stadium: "BMO Field",                   capacity: 45500 },
    "Vancouver":       { country: "Canada", stadium: "BC Place",                    capacity: 54500 },
    "Arlington":       { country: "USA",    stadium: "AT&T Stadium (Dallas)",       capacity: 94000 },
    "East Rutherford": { country: "USA",    stadium: "MetLife Stadium",             capacity: 82500 },
    "Atlanta":         { country: "USA",    stadium: "Mercedes-Benz Stadium",       capacity: 71000 },
    "Inglewood":       { country: "USA",    stadium: "SoFi Stadium (LA)",           capacity: 70240 },
    "Miami Gardens":   { country: "USA",    stadium: "Hard Rock Stadium",           capacity: 65326 },
    "Seattle":         { country: "USA",    stadium: "Lumen Field",                 capacity: 68740 },
    "Houston":         { country: "USA",    stadium: "NRG Stadium",                 capacity: 72220 },
    "Philadelphia":    { country: "USA",    stadium: "Lincoln Financial Field",     capacity: 69796 },
    "Kansas City":     { country: "USA",    stadium: "Arrowhead Stadium",           capacity: 76416 },
    "Santa Clara":     { country: "USA",    stadium: "Levi's Stadium (SF Bay)",     capacity: 68500 },
    "Foxborough":      { country: "USA",    stadium: "Gillette Stadium (Boston)",   capacity: 65878 },
  },

  groupMatches: [
    // MATCHDAY 1
    { id:"match_1",  matchNum:1,  group:"A", date:"2026-06-11", kickoffET:"3:00 PM",  team1:"Mexico",                  team2:"South Africa",           venue:"Mexico City",    matchday:1 },
    { id:"match_2",  matchNum:2,  group:"A", date:"2026-06-11", kickoffET:"10:00 PM", team1:"South Korea",             team2:"UEFA Path D",             venue:"Zapopan",        matchday:1 },
    { id:"match_3",  matchNum:3,  group:"B", date:"2026-06-12", kickoffET:"3:00 PM",  team1:"Canada",                  team2:"UEFA Path A",             venue:"Toronto",        matchday:1 },
    { id:"match_4",  matchNum:4,  group:"D", date:"2026-06-12", kickoffET:"9:00 PM",  team1:"United States",           team2:"Paraguay",                venue:"Inglewood",      matchday:1 },
    { id:"match_5",  matchNum:5,  group:"B", date:"2026-06-13", kickoffET:"3:00 PM",  team1:"Qatar",                   team2:"Switzerland",             venue:"Santa Clara",    matchday:1 },
    { id:"match_6",  matchNum:6,  group:"C", date:"2026-06-13", kickoffET:"6:00 PM",  team1:"Brazil",                  team2:"Morocco",                 venue:"East Rutherford",matchday:1 },
    { id:"match_7",  matchNum:7,  group:"C", date:"2026-06-13", kickoffET:"9:00 PM",  team1:"Haiti",                   team2:"Scotland",                venue:"Foxborough",     matchday:1 },
    { id:"match_8",  matchNum:8,  group:"D", date:"2026-06-13", kickoffET:"12:00 AM", team1:"Australia",               team2:"UEFA Path C",             venue:"Vancouver",      matchday:1, nextDay:true },
    { id:"match_9",  matchNum:9,  group:"E", date:"2026-06-14", kickoffET:"1:00 PM",  team1:"Germany",                 team2:"Curaçao",                 venue:"Houston",        matchday:1 },
    { id:"match_10", matchNum:10, group:"F", date:"2026-06-14", kickoffET:"4:00 PM",  team1:"Netherlands",             team2:"Japan",                   venue:"Arlington",      matchday:1 },
    { id:"match_11", matchNum:11, group:"E", date:"2026-06-14", kickoffET:"7:00 PM",  team1:"Ivory Coast",             team2:"Ecuador",                 venue:"Philadelphia",   matchday:1 },
    { id:"match_12", matchNum:12, group:"F", date:"2026-06-14", kickoffET:"10:00 PM", team1:"UEFA Path B",             team2:"Tunisia",                 venue:"Zapopan",        matchday:1 },
    { id:"match_13", matchNum:13, group:"H", date:"2026-06-15", kickoffET:"1:00 PM",  team1:"Spain",                   team2:"Cape Verde",              venue:"Atlanta",        matchday:1 },
    { id:"match_14", matchNum:14, group:"G", date:"2026-06-15", kickoffET:"6:00 PM",  team1:"Belgium",                 team2:"Egypt",                   venue:"Seattle",        matchday:1 },
    { id:"match_15", matchNum:15, group:"H", date:"2026-06-15", kickoffET:"6:00 PM",  team1:"Saudi Arabia",            team2:"Uruguay",                 venue:"Miami Gardens",  matchday:1 },
    { id:"match_16", matchNum:16, group:"G", date:"2026-06-15", kickoffET:"12:00 AM", team1:"Iran",                    team2:"New Zealand",             venue:"Inglewood",      matchday:1, nextDay:true },
    { id:"match_17", matchNum:17, group:"I", date:"2026-06-16", kickoffET:"3:00 PM",  team1:"France",                  team2:"Senegal",                 venue:"East Rutherford",matchday:1 },
    { id:"match_18", matchNum:18, group:"I", date:"2026-06-16", kickoffET:"6:00 PM",  team1:"Intercontinental Path 2", team2:"Norway",                  venue:"Foxborough",     matchday:1 },
    { id:"match_19", matchNum:19, group:"J", date:"2026-06-16", kickoffET:"9:00 PM",  team1:"Argentina",               team2:"Algeria",                 venue:"Kansas City",    matchday:1 },
    { id:"match_20", matchNum:20, group:"J", date:"2026-06-16", kickoffET:"12:00 AM", team1:"Austria",                 team2:"Jordan",                  venue:"Santa Clara",    matchday:1, nextDay:true },
    { id:"match_21", matchNum:21, group:"K", date:"2026-06-17", kickoffET:"1:00 PM",  team1:"Portugal",                team2:"Intercontinental Path 1", venue:"Houston",        matchday:1 },
    { id:"match_22", matchNum:22, group:"L", date:"2026-06-17", kickoffET:"4:00 PM",  team1:"England",                 team2:"Croatia",                 venue:"Arlington",      matchday:1 },
    { id:"match_23", matchNum:23, group:"L", date:"2026-06-17", kickoffET:"7:00 PM",  team1:"Ghana",                   team2:"Panama",                  venue:"Toronto",        matchday:1 },
    { id:"match_24", matchNum:24, group:"K", date:"2026-06-17", kickoffET:"10:00 PM", team1:"Uzbekistan",              team2:"Colombia",                venue:"Mexico City",    matchday:1 },

    // MATCHDAY 2
    { id:"match_25", matchNum:25, group:"A", date:"2026-06-18", kickoffET:"12:00 PM", team1:"UEFA Path D",             team2:"South Africa",            venue:"Atlanta",        matchday:2 },
    { id:"match_26", matchNum:26, group:"B", date:"2026-06-18", kickoffET:"3:00 PM",  team1:"Switzerland",             team2:"UEFA Path A",             venue:"Inglewood",      matchday:2 },
    { id:"match_27", matchNum:27, group:"B", date:"2026-06-18", kickoffET:"6:00 PM",  team1:"Canada",                  team2:"Qatar",                   venue:"Vancouver",      matchday:2 },
    { id:"match_28", matchNum:28, group:"A", date:"2026-06-18", kickoffET:"11:00 PM", team1:"Mexico",                  team2:"South Korea",             venue:"Zapopan",        matchday:2 },
    { id:"match_29", matchNum:29, group:"D", date:"2026-06-19", kickoffET:"12:00 AM", team1:"UEFA Path C",             team2:"Paraguay",                venue:"Santa Clara",    matchday:2, nextDay:true },
    { id:"match_30", matchNum:30, group:"D", date:"2026-06-19", kickoffET:"3:00 PM",  team1:"United States",           team2:"Australia",               venue:"Seattle",        matchday:2 },
    { id:"match_31", matchNum:31, group:"C", date:"2026-06-19", kickoffET:"6:00 PM",  team1:"Scotland",                team2:"Morocco",                 venue:"Foxborough",     matchday:2 },
    { id:"match_32", matchNum:32, group:"C", date:"2026-06-19", kickoffET:"9:00 PM",  team1:"Brazil",                  team2:"Haiti",                   venue:"Philadelphia",   matchday:2 },
    { id:"match_33", matchNum:33, group:"F", date:"2026-06-20", kickoffET:"1:00 PM",  team1:"Netherlands",             team2:"UEFA Path B",             venue:"Houston",        matchday:2 },
    { id:"match_34", matchNum:34, group:"E", date:"2026-06-20", kickoffET:"4:00 PM",  team1:"Germany",                 team2:"Ivory Coast",             venue:"Toronto",        matchday:2 },
    { id:"match_35", matchNum:35, group:"E", date:"2026-06-20", kickoffET:"8:00 PM",  team1:"Ecuador",                 team2:"Curaçao",                 venue:"Kansas City",    matchday:2 },
    { id:"match_36", matchNum:36, group:"F", date:"2026-06-20", kickoffET:"12:00 AM", team1:"Tunisia",                 team2:"Japan",                   venue:"Zapopan",        matchday:2, nextDay:true },
    { id:"match_37", matchNum:37, group:"H", date:"2026-06-21", kickoffET:"12:00 PM", team1:"Spain",                   team2:"Saudi Arabia",            venue:"Atlanta",        matchday:2 },
    { id:"match_38", matchNum:38, group:"G", date:"2026-06-21", kickoffET:"3:00 PM",  team1:"Belgium",                 team2:"Iran",                    venue:"Inglewood",      matchday:2 },
    { id:"match_39", matchNum:39, group:"H", date:"2026-06-21", kickoffET:"6:00 PM",  team1:"Uruguay",                 team2:"Cape Verde",              venue:"Miami Gardens",  matchday:2 },
    { id:"match_40", matchNum:40, group:"G", date:"2026-06-21", kickoffET:"9:00 PM",  team1:"New Zealand",             team2:"Egypt",                   venue:"Vancouver",      matchday:2 },
    { id:"match_41", matchNum:41, group:"J", date:"2026-06-22", kickoffET:"1:00 PM",  team1:"Argentina",               team2:"Austria",                 venue:"Arlington",      matchday:2 },
    { id:"match_42", matchNum:42, group:"I", date:"2026-06-22", kickoffET:"5:00 PM",  team1:"France",                  team2:"Intercontinental Path 2", venue:"Philadelphia",   matchday:2 },
    { id:"match_43", matchNum:43, group:"I", date:"2026-06-22", kickoffET:"8:00 PM",  team1:"Norway",                  team2:"Senegal",                 venue:"East Rutherford",matchday:2 },
    { id:"match_44", matchNum:44, group:"J", date:"2026-06-22", kickoffET:"11:00 PM", team1:"Jordan",                  team2:"Algeria",                 venue:"Santa Clara",    matchday:2 },
    { id:"match_45", matchNum:45, group:"K", date:"2026-06-23", kickoffET:"1:00 PM",  team1:"Portugal",                team2:"Uzbekistan",              venue:"Houston",        matchday:2 },
    { id:"match_46", matchNum:46, group:"L", date:"2026-06-23", kickoffET:"4:00 PM",  team1:"England",                 team2:"Ghana",                   venue:"Foxborough",     matchday:2 },
    { id:"match_47", matchNum:47, group:"L", date:"2026-06-23", kickoffET:"7:00 PM",  team1:"Panama",                  team2:"Croatia",                 venue:"Toronto",        matchday:2 },
    { id:"match_48", matchNum:48, group:"K", date:"2026-06-23", kickoffET:"10:00 PM", team1:"Colombia",                team2:"Intercontinental Path 1", venue:"Zapopan",        matchday:2 },

    // MATCHDAY 3 (simultaneous per group)
    { id:"match_49", matchNum:49, group:"B", date:"2026-06-24", kickoffET:"3:00 PM",  team1:"Switzerland",             team2:"Canada",                  venue:"Vancouver",      matchday:3, simultaneous:true },
    { id:"match_50", matchNum:50, group:"B", date:"2026-06-24", kickoffET:"3:00 PM",  team1:"UEFA Path A",             team2:"Qatar",                   venue:"Seattle",        matchday:3, simultaneous:true },
    { id:"match_51", matchNum:51, group:"C", date:"2026-06-24", kickoffET:"6:00 PM",  team1:"Scotland",                team2:"Brazil",                  venue:"Miami Gardens",  matchday:3, simultaneous:true },
    { id:"match_52", matchNum:52, group:"C", date:"2026-06-24", kickoffET:"6:00 PM",  team1:"Morocco",                 team2:"Haiti",                   venue:"Atlanta",        matchday:3, simultaneous:true },
    { id:"match_53", matchNum:53, group:"A", date:"2026-06-24", kickoffET:"9:00 PM",  team1:"UEFA Path D",             team2:"Mexico",                  venue:"Mexico City",    matchday:3, simultaneous:true },
    { id:"match_54", matchNum:54, group:"A", date:"2026-06-24", kickoffET:"9:00 PM",  team1:"South Africa",            team2:"South Korea",             venue:"Zapopan",        matchday:3, simultaneous:true },
    { id:"match_55", matchNum:55, group:"E", date:"2026-06-25", kickoffET:"4:00 PM",  team1:"Ecuador",                 team2:"Germany",                 venue:"East Rutherford",matchday:3, simultaneous:true },
    { id:"match_56", matchNum:56, group:"E", date:"2026-06-25", kickoffET:"4:00 PM",  team1:"Curaçao",                 team2:"Ivory Coast",             venue:"Philadelphia",   matchday:3, simultaneous:true },
    { id:"match_57", matchNum:57, group:"F", date:"2026-06-25", kickoffET:"7:00 PM",  team1:"Japan",                   team2:"UEFA Path B",             venue:"Arlington",      matchday:3, simultaneous:true },
    { id:"match_58", matchNum:58, group:"F", date:"2026-06-25", kickoffET:"7:00 PM",  team1:"Tunisia",                 team2:"Netherlands",             venue:"Kansas City",    matchday:3, simultaneous:true },
    { id:"match_59", matchNum:59, group:"D", date:"2026-06-25", kickoffET:"10:00 PM", team1:"UEFA Path C",             team2:"United States",           venue:"Inglewood",      matchday:3, simultaneous:true },
    { id:"match_60", matchNum:60, group:"D", date:"2026-06-25", kickoffET:"10:00 PM", team1:"Paraguay",                team2:"Australia",               venue:"Santa Clara",    matchday:3, simultaneous:true },
    { id:"match_61", matchNum:61, group:"I", date:"2026-06-26", kickoffET:"3:00 PM",  team1:"Norway",                  team2:"France",                  venue:"Foxborough",     matchday:3, simultaneous:true },
    { id:"match_62", matchNum:62, group:"I", date:"2026-06-26", kickoffET:"3:00 PM",  team1:"Senegal",                 team2:"Intercontinental Path 2", venue:"Toronto",        matchday:3, simultaneous:true },
    { id:"match_63", matchNum:63, group:"H", date:"2026-06-26", kickoffET:"8:00 PM",  team1:"Cape Verde",              team2:"Saudi Arabia",            venue:"Houston",        matchday:3, simultaneous:true },
    { id:"match_64", matchNum:64, group:"H", date:"2026-06-26", kickoffET:"8:00 PM",  team1:"Uruguay",                 team2:"Spain",                   venue:"Zapopan",        matchday:3, simultaneous:true },
    { id:"match_65", matchNum:65, group:"G", date:"2026-06-26", kickoffET:"11:00 PM", team1:"Egypt",                   team2:"Iran",                    venue:"Seattle",        matchday:3, simultaneous:true },
    { id:"match_66", matchNum:66, group:"G", date:"2026-06-26", kickoffET:"11:00 PM", team1:"New Zealand",             team2:"Belgium",                 venue:"Vancouver",      matchday:3, simultaneous:true },
    { id:"match_67", matchNum:67, group:"L", date:"2026-06-27", kickoffET:"5:00 PM",  team1:"Panama",                  team2:"England",                 venue:"East Rutherford",matchday:3, simultaneous:true },
    { id:"match_68", matchNum:68, group:"L", date:"2026-06-27", kickoffET:"5:00 PM",  team1:"Croatia",                 team2:"Ghana",                   venue:"Philadelphia",   matchday:3, simultaneous:true },
    { id:"match_69", matchNum:69, group:"K", date:"2026-06-27", kickoffET:"7:30 PM",  team1:"Colombia",                team2:"Portugal",                venue:"Miami Gardens",  matchday:3, simultaneous:true },
    { id:"match_70", matchNum:70, group:"K", date:"2026-06-27", kickoffET:"7:30 PM",  team1:"Intercontinental Path 1", team2:"Uzbekistan",              venue:"Atlanta",        matchday:3, simultaneous:true },
    { id:"match_71", matchNum:71, group:"J", date:"2026-06-27", kickoffET:"10:00 PM", team1:"Algeria",                 team2:"Austria",                 venue:"Kansas City",    matchday:3, simultaneous:true },
    { id:"match_72", matchNum:72, group:"J", date:"2026-06-27", kickoffET:"10:00 PM", team1:"Jordan",                  team2:"Argentina",               venue:"Arlington",      matchday:3, simultaneous:true },
  ],

  knockoutMatches: [
    // ROUND OF 32
    { id:"match_73",  matchNum:73,  round:"R32",   date:"2026-06-28", team1Desc:"2nd Group A",     team2Desc:"2nd Group B",         venue:"Inglewood",      feedsMatch:"match_90" },
    { id:"match_74",  matchNum:74,  round:"R32",   date:"2026-06-29", team1Desc:"1st Group C",     team2Desc:"2nd Group F",         venue:"Houston",        feedsMatch:"match_89" },
    { id:"match_75",  matchNum:75,  round:"R32",   date:"2026-06-29", team1Desc:"1st Group E",     team2Desc:"Best 3rd A/B/C/D/F", venue:"Foxborough",     feedsMatch:"match_89" },
    { id:"match_76",  matchNum:76,  round:"R32",   date:"2026-06-29", team1Desc:"1st Group F",     team2Desc:"2nd Group C",         venue:"Zapopan",        feedsMatch:"match_92" },
    { id:"match_77",  matchNum:77,  round:"R32",   date:"2026-06-30", team1Desc:"2nd Group E",     team2Desc:"2nd Group I",         venue:"Arlington",      feedsMatch:"match_91" },
    { id:"match_78",  matchNum:78,  round:"R32",   date:"2026-06-30", team1Desc:"1st Group I",     team2Desc:"Best 3rd C/D/F/G/H", venue:"East Rutherford",feedsMatch:"match_91" },
    { id:"match_79",  matchNum:79,  round:"R32",   date:"2026-06-30", team1Desc:"1st Group A",     team2Desc:"Best 3rd C/E/F/H/I", venue:"Mexico City",    feedsMatch:"match_90" },
    { id:"match_80",  matchNum:80,  round:"R32",   date:"2026-07-01", team1Desc:"1st Group L",     team2Desc:"Best 3rd E/H/I/J/K", venue:"Atlanta",        feedsMatch:"match_94" },
    { id:"match_81",  matchNum:81,  round:"R32",   date:"2026-07-01", team1Desc:"1st Group G",     team2Desc:"Best 3rd A/E/H/I/J", venue:"Seattle",        feedsMatch:"match_96" },
    { id:"match_82",  matchNum:82,  round:"R32",   date:"2026-07-01", team1Desc:"1st Group D",     team2Desc:"Best 3rd B/E/F/I/J", venue:"Santa Clara",    feedsMatch:"match_92" },
    { id:"match_83",  matchNum:83,  round:"R32",   date:"2026-07-02", team1Desc:"1st Group H",     team2Desc:"2nd Group J",         venue:"Inglewood",      feedsMatch:"match_93" },
    { id:"match_84",  matchNum:84,  round:"R32",   date:"2026-07-02", team1Desc:"2nd Group K",     team2Desc:"2nd Group L",         venue:"Toronto",        feedsMatch:"match_94" },
    { id:"match_85",  matchNum:85,  round:"R32",   date:"2026-07-02", team1Desc:"1st Group B",     team2Desc:"Best 3rd E/F/G/I/J", venue:"Vancouver",      feedsMatch:"match_95" },
    { id:"match_86",  matchNum:86,  round:"R32",   date:"2026-07-03", team1Desc:"2nd Group D",     team2Desc:"2nd Group G",         venue:"Arlington",      feedsMatch:"match_96" },
    { id:"match_87",  matchNum:87,  round:"R32",   date:"2026-07-03", team1Desc:"1st Group J",     team2Desc:"2nd Group H",         venue:"Miami Gardens",  feedsMatch:"match_93" },
    { id:"match_88",  matchNum:88,  round:"R32",   date:"2026-07-03", team1Desc:"1st Group K",     team2Desc:"Best 3rd D/E/I/J/L", venue:"Kansas City",    feedsMatch:"match_95" },

    // ROUND OF 16
    { id:"match_89",  matchNum:89,  round:"R16",   date:"2026-07-04", team1Desc:"W Match 74",      team2Desc:"W Match 75",          venue:"Houston",        feedsMatch:"match_97" },
    { id:"match_90",  matchNum:90,  round:"R16",   date:"2026-07-04", team1Desc:"W Match 73",      team2Desc:"W Match 79",          venue:"Philadelphia",   feedsMatch:"match_97" },
    { id:"match_91",  matchNum:91,  round:"R16",   date:"2026-07-05", team1Desc:"W Match 77",      team2Desc:"W Match 78",          venue:"East Rutherford",feedsMatch:"match_98" },
    { id:"match_92",  matchNum:92,  round:"R16",   date:"2026-07-05", team1Desc:"W Match 76",      team2Desc:"W Match 82",          venue:"Mexico City",    feedsMatch:"match_98" },
    { id:"match_93",  matchNum:93,  round:"R16",   date:"2026-07-06", team1Desc:"W Match 83",      team2Desc:"W Match 87",          venue:"Arlington",      feedsMatch:"match_99" },
    { id:"match_94",  matchNum:94,  round:"R16",   date:"2026-07-06", team1Desc:"W Match 80",      team2Desc:"W Match 84",          venue:"Seattle",        feedsMatch:"match_99" },
    { id:"match_95",  matchNum:95,  round:"R16",   date:"2026-07-07", team1Desc:"W Match 85",      team2Desc:"W Match 88",          venue:"Atlanta",        feedsMatch:"match_100" },
    { id:"match_96",  matchNum:96,  round:"R16",   date:"2026-07-07", team1Desc:"W Match 81",      team2Desc:"W Match 86",          venue:"Vancouver",      feedsMatch:"match_100" },

    // QUARTERFINALS
    { id:"match_97",  matchNum:97,  round:"QF",    date:"2026-07-09", team1Desc:"W Match 89",      team2Desc:"W Match 90",          venue:"Foxborough",     feedsMatch:"match_101" },
    { id:"match_98",  matchNum:98,  round:"QF",    date:"2026-07-10", team1Desc:"W Match 91",      team2Desc:"W Match 92",          venue:"Inglewood",      feedsMatch:"match_101" },
    { id:"match_99",  matchNum:99,  round:"QF",    date:"2026-07-11", team1Desc:"W Match 93",      team2Desc:"W Match 94",          venue:"Miami Gardens",  feedsMatch:"match_102" },
    { id:"match_100", matchNum:100, round:"QF",    date:"2026-07-11", team1Desc:"W Match 95",      team2Desc:"W Match 96",          venue:"Kansas City",    feedsMatch:"match_102" },

    // SEMIFINALS
    { id:"match_101", matchNum:101, round:"SF",    date:"2026-07-14", team1Desc:"W Match 97",      team2Desc:"W Match 98",          venue:"Arlington",      feedsMatch:"match_104", loserMatch:"match_103" },
    { id:"match_102", matchNum:102, round:"SF",    date:"2026-07-15", team1Desc:"W Match 99",      team2Desc:"W Match 100",         venue:"Atlanta",        feedsMatch:"match_104", loserMatch:"match_103" },

    // THIRD PLACE
    { id:"match_103", matchNum:103, round:"3RD",   date:"2026-07-18", team1Desc:"L Match 101",     team2Desc:"L Match 102",         venue:"Miami Gardens",  feedsMatch:null },

    // FINAL
    { id:"match_104", matchNum:104, round:"FINAL", date:"2026-07-19", team1Desc:"W Match 101",     team2Desc:"W Match 102",         venue:"East Rutherford",feedsMatch:null },
  ],

  roundLabels: {
    "R32":   "Round of 32",
    "R16":   "Round of 16",
    "QF":    "Quarterfinals",
    "SF":    "Semifinals",
    "3RD":   "Third Place",
    "FINAL": "Final",
  },

  scoring: {
    correctGroupMatchWinner: 2,
    correctTournamentWinner: 15,
    correctR32Winner:        3,
    correctR16Winner:        5,
    correctQFWinner:         7,
    correctSFWinner:         9,
    correctFinalWinner:      12,
  },

  dates: {
    phase1LockDate: "2026-06-11",
    phase1LockTime: "15:00",
    phase2OpenDate: "2026-06-28",
    phase2LockDate: "2026-06-28",
    phase2LockTime: "15:00",
    tournamentEnd:  "2026-07-19",
  },
};

// ── Helpers ──
export function getGroupTeams(g)    { return TOURNAMENT_DATA.groups[g].teams; }
export function getGroupMatches(g)  { return TOURNAMENT_DATA.groupMatches.filter(m => m.group === g); }
export function getAllTeams()        { return Object.keys(TOURNAMENT_DATA.teams); }
export function getConfirmedTeams() { return Object.keys(TOURNAMENT_DATA.teams).filter(t => !TOURNAMENT_DATA.teams[t].tbd); }
export function getTeamFlag(key)    { return TOURNAMENT_DATA.teams[key]?.flag ?? "🏳️"; }
export function shortName(key)      { return key.replace("UEFA Path ","Path ").replace("Intercontinental Path ","IC Path "); }
export function formatMatchDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" });
}