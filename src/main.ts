import "./style.css";
import { fromEvent, map, of, Subject, Observable } from "rxjs";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <section id="center">
    <button id="counter" type="button" class="counter">
      Click
    </button>
  </section>
`;

// Normally you register event listeners.
document.addEventListener("click", function () {
  console.log("Native Click!");
});
// Using RxJS you create an observable instead.
fromEvent(document, "click").subscribe(() => console.log("Clicked!"));

// -------------------------
// Observable using of()
// -------------------------

const numbers$ = of(1, 2, 3);

numbers$.subscribe((value) => {
  console.log("number:", value);
});

const result$ = numbers$.pipe(map((x) => x * 2)); // new observable

result$.subscribe((value) => {
  console.log("number with pipe * 2:", value);
});

// -------------------------
// Observable using fromEvent()
// -------------------------

const clicks$ = fromEvent<MouseEvent>(document, "click");

clicks$.subscribe((event) => {
  console.log("Button clicked!");
  console.log("X:", event.clientX);
  console.log("Y:", event.clientY);
});

// -------------------------
// map()
// -------------------------

clicks$.pipe(map((event) => event.clientX)).subscribe((x) => {
  console.log("Client X:", x);
});

// -------------------------
// Subject() = Observable + Observer
// -------------------------

const subject = new Subject<number>();

subject.subscribe((value) => {
  console.log("A:", value);
});

subject.subscribe((value) => {
  console.log("B:", value);
});

subject.next(10);

subject.unsubscribe();

// -------------------------
// Observable
// -------------------------

const observable = new Observable((subscriber) => {
  console.log("just before subscribe inside observable");

  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 5000);
});

console.log("just before subscribe outside observable");

observable.subscribe({
  next(x) {
    console.log("got value " + x);
  },
  error(err) {
    console.error("something wrong occurred: " + err);
  },
  complete() {
    console.log("done");
  },
});

console.log("just after subscribe");

// just before subscribe outside observable
// just before subscribe inside observable
// got value 1
// got value 2
// got value 3
// just after subscribe
// got value 4
// done

// Interview Question 🔥
// هل Observable asynchronous؟
// الإجابة: لا.
// ودي من أشهر الـ tricky questions.
// Observable نفسها مش معناها asynchronous.
// Observable ممكن تكون:

// Synchronous
// const observable = new Observable(subscriber => {
//   subscriber.next(1);
//   subscriber.next(2);
//   subscriber.next(3);
// });

// هنا:
// subscribe
//  ↓
// 1
// 2
// 3
//  ↓
// continue
// كلها synchronous.

// Asynchronous
// const observable = new Observable(subscriber => {
//   setTimeout(() => {
//     subscriber.next(1);
//   }, 1000);
// });

// هنا القيمة asynchronous.
// إذن:
// Observable can emit synchronously or asynchronously.

// -------------------------
// Observable
// -------------------------

const observable2 = new Observable((subscriber) => {
  console.log("just before subscribe inside observable2");

  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.complete();
  }, 5000);
  subscriber.next(4);
});

console.log("just before subscribe outside observable2");

observable2.subscribe({
  next(x) {
    console.log("got value from observable2 " + x);
  },
  error(err) {
    console.error("something wrong occurred: " + err);
  },
  complete() {
    console.log("done observable2");
  },
});

console.log("just after subscribe observable2");

// just before subscribe outside observable2
// just before subscribe inside observable2
// got value from observable2 1
// got value from observable2 2
// got value from observable2 3
// got value from observable2 4
// just after subscribe observable2
// done observable2

// -------------------------
// Observable
// -------------------------

const observable3 = new Observable((subscriber) => {
  console.log("just before subscribe inside observable3");

  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
  }, 5000);
  subscriber.complete();
});

console.log("just before subscribe outside observable3");

observable3.subscribe({
  next(x) {
    console.log("got value from observable3 " + x);
  },
  error(err) {
    console.error("something wrong occurred: " + err);
  },
  complete() {
    console.log("done observable3");
  },
});

console.log("just after subscribe observable3");

// just before subscribe outside observable3
// just before subscribe inside observable3
// got value from observable3 1
// got value from observable3 2
// got value from observable3 3
// done observable3
// just after subscribe observable3

// كل subscribe() أنشأ Observable execution مستقل
// func.call() means "give me one value synchronously"
// observable.subscribe() means "give me any amount of values, either synchronously or asynchronously"