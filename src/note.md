## useEffect : like event listener change, (for prop and state variable)

Whenever a dependency changes, it will execute the effect again.

-   [!NOTE] :
    Dogrudan fetch icerisinde useState kullanilirsa sonsuz donguye girer , surekli istek atar.
    Bunun yerine ComponentDidMount ya da useEffect kullan.
    []: Dependency array : Bir kere baslangicta render et.
    [$query]: $query render olduktan sonra

    // useEffect(function () {

*   // console.log("After initial render because of empty array '[]'");
*   // }, []);
*
*   // useEffect(function () {
*   // console.log("After each render.");
*   // }); // if not added [] each render run.
*
*   // useEffect(function () {
*   // console.log("Just after query render")
*   // }, [query]);
*

JSX : Html kodu icerisine js gomuyorsun. XML gibi bir soz dizimi. ilk olarak facebook => react da kullanmis.
