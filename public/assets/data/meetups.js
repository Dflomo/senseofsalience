/* MEETUPS. Edit this file, then upload it. Nothing shows until you add an entry.
   next: set to an object when a gathering is scheduled, or null for none.
     { title, date:"Sat, Nov 8", time:"6:00 PM", place:"Santa Rosa, CA", blurb:"What to expect", link:"https://...", linkLabel:"RSVP" }
   upcoming: more scheduled gatherings after "next" (same fields). Can be [].
   notes: the running list of what happened, newest first.
     { date:"Oct 25, 2026", title:"First gathering", recap:"A short paragraph.", highlights:["thing we did","another thing"] } */
window.MEETUPS={
next:null,
upcoming:[],
notes:[]
};
