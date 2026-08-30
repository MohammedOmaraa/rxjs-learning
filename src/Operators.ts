// Operator = Function
// تأخذ Observable → تعمل عليه Processing → ترجع Observable جديد.

import {
  concatAll,
  concatMap,
  EMPTY,
  filter,
  first,
  interval,
  map,
  of,
  pipe,
  take,
} from "rxjs";

// Observable
//     │
//     ▼
//  Operator
//     │
//     ▼
// New Observable

// of(1, 2, 3)
//   .pipe(
//     map(x => x * 2)
//   );

// Source Observable
//       │ 1
//       │ 2
//       │ 3
//       ▼
//     map(x * 2)
//       │ 2
//       │ 4
//       │ 6
//       ▼
// New Observable

// هل Operator تعدل الـ Original Observable؟ No
// const source$ = of(1, 2, 3);
// const result$ = source$.pipe(
//   map(x => x * 2)
// );

// source$
//    │
//    ├── 1
//    ├── 2
//    └── 3

// result$
//    │
//    ├── 2
//    ├── 4
//    └── 6

// source$ ≠ result$
// والـ source لم تتغير.
// هذا يسمى:
// Immutability / Pure Operation

// --------------------

const source$ = of(1, 2, 3);

const doubled$ = source$.pipe(map((x) => x * 2));

source$.subscribe((value) => {
  console.log("Source:", value);
});

doubled$.subscribe((value) => {
  console.log("Doubled:", value);
});
// output =>
// Source: 1
// Source: 2
// Source: 3
// Doubled: 2
// Doubled: 4
// Doubled: 6

// --------------------

// There are two kinds of operators
// 1️⃣ Pipeable Operators
// map(), filter(), tap(), switchMap(), mergeMap(), take()

// تستخدم داخل:
// observable.pipe()

// source$.pipe(
//   filter(x => x > 10),
//   map(x => x * 2)
// );

// 2️⃣ Creation Operators
// of(), from(), interval(), timer(), fromEvent()

// هذه وظيفتها:
// إنشاء Observable.

// const numbers$ = of(1, 2, 3);
// of() أنشأت Observable.

// --------------------

// الـ Docs تقول ممكن تكتب:
// op3()(
//   op2()(
//     op1()(source$)
//   )
// );

// لكن هذا صعب جدًا للقراءة
// switchMap(...)(
//   filter(...)(
//     debounceTime(...)(
//       source$
//     )
//   )
// );

// we use

// source$.pipe(
//   debounceTime(500),
//   filter(...),
//   switchMap(...)
// );

// --------------------

// of(1, 2, 3)
//   .pipe(map((x) => x * x))
//   .subscribe((v) => console.log(`value: ${v}`));

// output =>
// value: 1
// value: 4
// value: 9

// --------------------

// of(1, 2, 3, 4, 5)
//   .pipe(
//     filter((x) => x % 2 === 0),
//     map((x) => x * 10),
//   )
//   .subscribe(console.log);

// output =>
// 20
// 40

// --------------------

// of(1, 2, 3).pipe(first()).subscribe(console.log);
// 1 ──► Complete

// output =>
// 1

// ---------- first() vs take() ----------

// Tricky Question
// take(1) => إذا لم توجد Values => Complete بدون Error
// first() إذا لم توجد Values => Error

// const observer = {
//   next: () => console.log("Observer got a next notification"),
//   complete: () => console.log("Observer got a complete notification"),
//   error: () => console.log("Observer got an error notification"),
// };

// EMPTY.pipe(first()).subscribe(observer);
// output =>
// Observer got an error notification

// EMPTY.pipe(take(1)).subscribe(observer);
// output =>
// Observer got a complete notification

// ---------- of() vs interval() ----------

// const observer2 = {
//   next: (v: any) => console.log("Observer got a value: ", v),
//   complete: () => console.log("Observer got a complete notification"),
//   error: () => console.log("Observer got an error notification"),
// };

// of(1, 2, 3, 4, 5).subscribe(observer2);
// of make complete automatically

// output =>
// Observer got a value:  1
// Observer got a value:  2
// Observer got a value:  3
// Observer got a value:  4
// Observer got a value:  5
// Observer got a complete notification

// interval(1000).subscribe(observer2)
// interval not make complete automatically so use take(), takeUntil()

// output =>
// 0 → 1 → 2 → 3 → 4 ... each 1(s)

// ---------- Higher-Order Observable ----------

// عادة Observable تصدر Values عادية => Observable<string> "Ahmed", "Mohamed", "Ali"
// لكن أحيانًا Observable تصدر Observable => Observable<Observable<string>> وهذا يسمى Higher-Order Observable

// of(1, 2, 3).subscribe(console.log);

// output =>
// 1 2 3

// source$.pipe(
//   map(value => of(value * 10))
// ).subscribe(console.log);

// output =>
// Observable(10) Observable(20) Observable(30)

// Observable
//      │
//      ▼
// Observable<Observable<number>>

// --------------------

// so you need to convert Observable<Observable<T>> to Observable<T> وهذا يسمى Flattening

source$
  .pipe(
    map((value) => of(value * 10)),
    concatAll(),
  )
  .subscribe(console.log);

// output =>
// 10 20 30

// --------------------

// urlObservable.pipe(
//   map(url => http.get(url))
// );

// افترض:
// url$ =
// "/api/products"
// "/api/users"
// "/api/orders"

// and http.get(url) return Observable<Product[]>

// url$.pipe( map(url => http.get(url))); that return Observable<Observable<Product[]>>

// الحل القديم
// url$.pipe(
//     map(url => http.get(url)),
//     concatAll()
// );

// the best solution

// url$.pipe(
//   concatMap(url => http.get(url))
// );

// so concatMap = map + concatAll

// Map Operators

// map() + concatAll() = concatMap()
// map() + mergeAll() = mergeMap()
// map() + switchAll() = switchMap()
// map() + exhaustAll() = exhaustMap()
// يحولون Value إلى Observable ثم يتعاملون مع الـ Inner Observable بطريقة مختلفة.

// ---------- concatMap vs mergeMap vs switchMap vs exhaustMap ----------

const observer = {
  next: () => console.log("Observer got a next notification"),
  complete: () => console.log("Observer got a complete notification"),
  error: () => console.log("Observer got an error notification"),
};

of("a", "b", "c")
  .pipe(concatMap((value) => fetch(`/api/search?q=${value}`)))
  .subscribe(observer);

// output =>
// Observer got a next notification
// Observer got a next notification
// Observer got a next notification
// Observer got a complete notification

// concatMap
// Request A
//      │
//      ▼ Complete
// Request B
//      │
//      ▼ Complete
// Request C

// As Queue A → B → C
// لا يبدأ التالي حتى ينتهي السابق.

// --------------------
// mergeMap

// كل الـ requests تعمل معًا:

// A ───────────────┐
// B ─────────┐     │
// C ─────┐   │     │
//        ▼   ▼     ▼
// أي نتيجة تصل يتم إرسالها.

// تستخدم في  تحميل بيانات مستقلة

// from(userIds).pipe(
//   mergeMap(id =>
//     this.http.get(`/api/users/${id}`)
//   )
// );
// يمكن تحميل أكثر من User في نفس الوقت.

// --------------------
// switchMap

// A starts
// B arrives
// ↓
// Cancel A
// ↓
// Start B
// C arrives
// ↓
// Cancel B
// ↓
// Start C

// searchInput$.pipe(
//   debounceTime(500),
//   distinctUntilChanged(),
//   switchMap((value) => this.http.get(`/api/search?q=${value}`)),
// );

// --------------------
// exhaustMap

// إذا بدأ Request:
// Request A
// وأثناء تنفيذه حدث
// Request B
// Request C
// Request D

// سيتم تجاهلهم.
// A ─────────────► Complete
// B ❌
// C ❌
// D ❌

// استخدام حقيقي
// زر Login

// loginClicks$.pipe(
//   exhaustMap(() =>
//     this.authService.login()
//   )
// );

// لو المستخدم ضغط:
// Login Login Login Login
// أثناء أول Request
// Ignore Ignore Ignore
// ممتاز لمنع Duplicate Requests.

// --------------------

// Operator	Behavior	Best Use
// concatMap	Queue	ترتيب مهم
// mergeMap	Parallel	عمليات مستقلة
// switchMap	Cancel previous	Search / Latest data
// exhaustMap	Ignore new	Login / Submit

// احفظها بهذه الطريقة:

// concatMap  → Wait
// mergeMap   → All
// switchMap  → Latest
// exhaustMap → First

// ---------- Custom Operators ----------

// الـ Docs تقول:
// لو عندك Pipeline يتكرر كثيرًا
// بدل
// source$.pipe(
//   filter(value => value % 2 === 0),
//   map(value => value * 2)
// );

// يمكنك إنشاء Custom Operator.

// function discardOddDoubleEven() {
//   return pipe(
//     filter(value => value % 2 === 0),
//     map(value => value * 2)
//   );
// }

// then
// source$.pipe(
//   discardOddDoubleEven()
// );

// Source
//    │
//    ▼
// discardOddDoubleEven()
//    ├── filter()
//    ▼
//    ├── map()
//    ▼
// Result

// ---------- .pipe() vs pipe() ----------
// .pipe()

// observable.pipe(
//   map(...),
//   filter(...)
// );
// Observable Method
// .pipe() => Method موجودة على Observable.

// pipe()

// RxJS Function => need import
// pipe(
//   filter(...),
//   map(...)
// );

// pipe() => Function تستخدم لتركيب Operators.

// const customOperator = pipe(
//   filter(x => x > 10),
//   map(x => x * 2)
// );
// then use .pipe

// source$.pipe(
//   customOperator
// );

// ---------- Custom Operator ----------

// أي Pipeable Operator تقريبًا يكون بهذا الشكل:
// function myOperator<T>() {
//   return function(source$: Observable<T>) {
//     return new Observable<T>(subscriber => {
//       source$.subscribe({
//         next(value) {
//           subscriber.next(
//             // transformed value
//           );
//         },

//         error(err) {
//           subscriber.error(err);
//         },

//         complete() {
//           subscriber.complete();
//         }
//       });
//     });
//   };
// }

// function double() {
//   return function(source$: Observable<number>) {
//     return new Observable<number>(subscriber => {
//       const subscription = source$.subscribe({

//         next(value) {
//           subscriber.next(value * 2);
//         },

//         error(err) {
//           subscriber.error(err);
//         },

//         complete() {
//           subscriber.complete();
//         }
//       });
//       return () => {
//         subscription.unsubscribe();
//       };
//     });
//   };
// }

// of(1, 2, 3).pipe(double()).subscribe(console.log);

// 2
// 4
// 6

// ---------- CReal Project Example: Angular Search ----------

// searchControl.valueChanges.pipe(
//   debounceTime(500),
//   distinctUntilChanged(),
//   filter(value => value.length >= 2),
//   switchMap(value =>
//     this.http.get(`/api/products?search=${value}`)
//   )

// ).subscribe(products => {
//   console.log(products);
// });

// الـ Flow:

// User types
// "M"
//  │
//  ▼
// debounceTime(500)
//  │
//  ▼
// distinctUntilChanged()
//  │
//  ▼
// filter(length >= 2)
//  │
//  ▼
// switchMap()
//  │
//  ▼
// HTTP Request
//  │
//  ▼
// Products