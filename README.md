# odjazdy_na_zywo_zditm_szczecin
Jest to prosta aplikacja Node z wykorzystaniem bibliotek `express`, `axios` oraz `ejs`, która pobiera dane o rzeczywistym czasie odjazdu pojazdów komunikacji miejskiej w szczecinie

Dane pochodzą bezpośrednio z serwerów [Zarządu Dróg i Transportu Miejskiego w Szczecinie](https://www.zditm.szczecin.pl/pl).

## Uruchomienie aplikacji

### Wymagania

1. Zainstalowany `node` oraz `npm`.
2. Działający komputer :))))

### Uruchomienie

1. Pobierz lub sklonuj repozytorium
2. Otwórz terminal, wiersz poleceń w folderze projektu i wpisz następującą komendę:

    `npm install`

    Pobiera wszystkie potrzebne biblioteki użyte w projekcie
3. Teraz należy wpisać komendę `node index.js`. W tym momencie serwer został uruchomiony i można korzystać z aplikacji.
4. W przeglądarce należy wpisać w pole wyszukowania **Adres IP komputera** lub jeżeli lokalnie na komputerze jesteśmy to możemy użyć adresu `localhost` wraz z portem `3000`.
    Przykłady: `http://localhost:3000` lub `http://192.168.1.10:3000`.