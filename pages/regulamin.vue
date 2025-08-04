<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Spis treści (Lewa kolumna) -->
      <div class="lg:col-span-1 sticky top-8 self-start">
        <div class="bg-gray-50 p-4 rounded-lg shadow">
          <h2 class="font-bold text-lg mb-4 text-gray-800">Spis treści</h2>
          <nav class="toc-nav">
            <ul class="space-y-2">
              <li>
                <a
                  href="#informacje-ogolne"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  1. Informacje ogólne
                </a>
              </li>
              <li>
                <a
                  href="#definicje"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  2. Definicje
                </a>
              </li>
              <li>
                <a
                  href="#zamowienia"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  3. Zamówienia
                </a>
              </li>
              <li>
                <a
                  href="#platnosci"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  4. Płatności
                </a>
              </li>
              <li>
                <a
                  href="#dostawa"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  5. Dostawa
                </a>
              </li>
              <li>
                <a
                  href="#reklamacje"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  6. Reklamacje
                </a>
              </li>
              <li>
                <a
                  href="#zwroty"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  7. Zwroty i odstąpienie od umowy
                </a>
              </li>
              <li>
                <a
                  href="#dane-osobowe"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  8. Dane osobowe
                </a>
              </li>
              <li>
                <a
                  href="#postanowienia-koncowe"
                  class="text-green-600 hover:text-green-800 block py-1"
                >
                  9. Postanowienia końcowe
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Treść regulaminu (Prawa kolumna) -->
      <div class="lg:col-span-3">
        <div class="bg-white p-6 space-y-8">
          <!-- 1. Informacje ogólne -->
          <section id="informacje-ogolne" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">1. Informacje ogólne</h2>
            <p class="mb-4">
              Niniejszy Regulamin określa zasady korzystania ze Sklepu
              Internetowego dostępnego pod adresem
              <a
                href="https://www.example.com"
                class="text-green-600 hover:text-green-800"
                >www.example.com</a
              >
            </p>
            <p class="mb-4">
              Sklep Internetowy prowadzony jest przez Naszą Firmę Sp. z o.o. z
              siedzibą w Warszawie, ul. Przykładowa 123, 00-000 Warszawa,
              wpisaną do rejestru przedsiębiorców Krajowego Rejestru Sądowego
              prowadzonego przez Sąd Rejonowy dla m. st. Warszawy pod numerem
              KRS 0000000000, NIP 0000000000, REGON 000000000.
            </p>
            <p>
              Kontakt ze Sprzedawcą można uzyskać korzystając z adresu e-mail:
              kontakt@example.com lub telefonicznie pod numerem: +48 123 456
              789.
            </p>
          </section>

          <!-- 2. Definicje -->
          <section id="definicje" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">2. Definicje</h2>
            <p class="mb-4">
              Na potrzeby niniejszego Regulaminu, przyjmuje się następujące
              znaczenie poniższych pojęć:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>
                <strong>Sklep</strong> - sklep internetowy prowadzony przez
                Sprzedawcę pod adresem
                <a
                  href="https://www.example.com"
                  class="text-green-600 hover:text-green-800"
                  >www.example.com</a
                >
              </li>
              <li>
                <strong>Sprzedawca</strong> - Nasza Firma Sp. z o.o. z siedzibą
                w Warszawie
              </li>
              <li>
                <strong>Klient</strong> - każdy podmiot dokonujący zakupów za
                pośrednictwem Sklepu
              </li>
              <li>
                <strong>Konsument</strong> - osoba fizyczna dokonująca zakupów w
                Sklepie w zakresie niezwiązanym bezpośrednio z jej działalnością
                gospodarczą lub zawodową
              </li>
              <li><strong>Regulamin</strong> - niniejszy regulamin Sklepu</li>
              <li>
                <strong>Zamówienie</strong> - oświadczenie woli Klienta składane
                za pomocą Formularza Zamówienia i zmierzające bezpośrednio do
                zawarcia Umowy Sprzedaży Produktu ze Sprzedawcą
              </li>
            </ul>
          </section>

          <!-- 3. Zamówienia -->
          <section id="zamowienia" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">3. Zamówienia</h2>
            <p class="mb-4">
              Zamówienia w Sklepie można składać 24 godziny na dobę, 7 dni w
              tygodniu przez cały rok.
            </p>
            <p class="mb-4">W celu złożenia Zamówienia należy:</p>
            <ol class="list-decimal pl-6 space-y-2">
              <li>
                Wybrać Produkt będący przedmiotem Zamówienia i dodać go do
                koszyka
              </li>
              <li>
                Wypełnić Formularz Zamówienia poprzez wpisanie danych odbiorcy
                Zamówienia oraz adresu, na który ma nastąpić dostawa Produktu
              </li>
              <li>Wybrać rodzaj przesyłki (sposób dostarczenia Produktu)</li>
              <li>Wybrać sposób płatności</li>
              <li>Kliknąć przycisk "Zamawiam i płacę"</li>
            </ol>
            <p class="mt-4">
              Wysłanie przez Klienta Zamówienia stanowi oświadczenie woli
              zawarcia ze Sprzedawcą umowy sprzedaży, zgodnie z treścią
              Regulaminu.
            </p>
          </section>

          <!-- 4. Płatności -->
          <section id="platnosci" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">4. Płatności</h2>
            <p class="mb-4">Sklep udostępnia następujące sposoby płatności:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Płatność przelewem na konto Sprzedawcy</li>
              <li>Płatność za pobraniem przy odbiorze przesyłki</li>
              <li>
                Płatności elektroniczne realizowane za pośrednictwem serwisu
                Stripe
              </li>
              <li>
                Płatności kartą płatniczą realizowane za pośrednictwem serwisu
                Stripe
              </li>
            </ul>
            <p class="mt-4">
              W przypadku wyboru płatności przelewem, płatności elektronicznych
              lub kartą płatniczą, Klient zobowiązany jest do dokonania
              płatności w terminie 3 dni roboczych od dnia zawarcia Umowy
              Sprzedaży.
            </p>
          </section>

          <!-- 5. Dostawa -->
          <section id="dostawa" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">5. Dostawa</h2>
            <p class="mb-4">
              Dostawa Produktów dostępna jest na terytorium Rzeczypospolitej
              Polskiej oraz wybranych krajów Unii Europejskiej.
            </p>
            <p class="mb-4">
              Dostawa Produktu do Klienta jest odpłatna, chyba że Umowa
              Sprzedaży stanowi inaczej. Koszty dostawy Produktu są wskazywane
              Klientowi na stronach Sklepu w zakładce "Koszty dostawy" oraz w
              trakcie składania Zamówienia.
            </p>
            <p class="mb-4">
              Termin dostawy wynosi od 1 do 5 dni roboczych, licząc od dnia
              wysłania przez Klienta Zamówienia.
            </p>
            <p class="mb-4">
              Sprzedawca udostępnia następujące sposoby dostawy:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Przesyłka kurierska</li>
              <li>Przesyłka paczkomatowa</li>
              <li>Odbiór osobisty w siedzibie firmy</li>
            </ul>
          </section>

          <!-- 6. Reklamacje -->
          <section id="reklamacje" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">6. Reklamacje</h2>
            <p class="mb-4">
              Sprzedawca jest zobowiązany do dostarczenia Klientowi Produktów
              bez wad.
            </p>
            <p class="mb-4">
              W przypadku wystąpienia wady zakupionego u Sprzedawcy Produktu,
              Klient ma prawo do reklamacji w oparciu o przepisy dotyczące
              rękojmi w kodeksie cywilnym.
            </p>
            <p class="mb-4">
              Reklamację należy zgłosić pisemnie lub drogą elektroniczną na
              podane w niniejszym Regulaminie adresy Sprzedawcy.
            </p>
            <p class="mb-4">
              Sprzedawca ustosunkuje się do żądania reklamacyjnego niezwłocznie,
              nie później niż w terminie 14 dni, a jeśli nie zrobi tego w tym
              terminie, uważa się, że żądanie Klienta uznał za uzasadnione.
            </p>
          </section>

          <!-- 7. Zwroty -->
          <section id="zwroty" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">
              7. Zwroty i odstąpienie od umowy
            </h2>
            <p class="mb-4">
              Konsument ma prawo odstąpić od umowy zawartej na odległość w
              terminie 14 dni bez podania przyczyny.
            </p>
            <p class="mb-4">
              Bieg terminu do odstąpienia od umowy rozpoczyna się od dnia, w
              którym Konsument wszedł w posiadanie Produktu lub w którym osoba
              trzecia inna niż przewoźnik i wskazana przez Konsumenta weszła w
              posiadanie Produktu.
            </p>
            <p class="mb-4">
              Aby skorzystać z prawa odstąpienia od umowy, Konsument musi
              poinformować Sprzedawcę o swojej decyzji w drodze jednoznacznego
              oświadczenia (na przykład pismo wysłane pocztą, faksem lub pocztą
              elektroniczną).
            </p>
            <p class="mb-4">
              Konsument może skorzystać z wzoru formularza odstąpienia od umowy,
              jednak nie jest to obowiązkowe.
            </p>
            <p class="mb-4">
              Konsument ponosi bezpośrednie koszty zwrotu Produktu.
            </p>
          </section>

          <!-- 8. Dane osobowe -->
          <section id="dane-osobowe" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">8. Dane osobowe</h2>
            <p class="mb-4">
              Administratorem danych osobowych Klientów jest Sprzedawca.
            </p>
            <p class="mb-4">
              Dane osobowe Klientów zbierane są w celu realizacji Umowy
              Sprzedaży, a jeżeli Klient wyrazi na to zgodę - także w celu
              marketingowym.
            </p>
            <p class="mb-4">
              Klient ma prawo dostępu do treści swoich danych oraz ich
              poprawiania.
            </p>
            <p class="mb-4">
              Podanie danych osobowych jest dobrowolne, aczkolwiek niepodanie
              wskazanych w Regulaminie danych osobowych niezbędnych do zawarcia
              Umowy Sprzedaży skutkuje brakiem możliwości zawarcia tejże umowy.
            </p>
          </section>

          <!-- 9. Postanowienia końcowe -->
          <section id="postanowienia-koncowe" class="scroll-mt-8">
            <h2 class="text-2xl font-bold mb-4">9. Postanowienia końcowe</h2>
            <p class="mb-4">
              Umowy zawierane poprzez Sklep zawierane są w języku polskim.
            </p>
            <p class="mb-4">
              W sprawach nieuregulowanych w niniejszym Regulaminie mają
              zastosowanie powszechnie obowiązujące przepisy prawa polskiego, w
              szczególności: Kodeksu cywilnego; ustawy o świadczeniu usług drogą
              elektroniczną; ustawy o prawach konsumenta.
            </p>
            <p class="mb-4">
              Sprzedawca zastrzega sobie prawo do dokonywania zmian Regulaminu z
              ważnych przyczyn, w szczególności: zmiany przepisów prawa; zmiany
              sposobów płatności i dostaw; zmiany zakresu lub świadczenia usług.
            </p>
            <p class="mb-4">
              Zmiany Regulaminu obowiązują od momentu wyraźnego ich wskazania i
              umieszczenia na stronie Sklepu.
            </p>
            <p class="mb-4">
              Wszelkie spory powstałe pomiędzy Sprzedawcą a Konsumentem zostają
              poddane sądowi właściwemu ze względu na miejsce zamieszkania
              Konsumenta.
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dodanie smooth scrollowania po kliknięciu w link
onMounted(() => {
  const links = document.querySelectorAll(".toc-nav a");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const href = link.getAttribute("href");
      if (!href) return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 20,
          behavior: "smooth",
        });

        // Aktualizacja adresu URL dla możliwości bookmarkowania
        history.pushState(null, "", href);
      }
    });
  });

  // Sprawdzamy czy jest fragment URL (hash) przy ładowaniu strony
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      setTimeout(() => {
        window.scrollTo({
          top: targetElement.offsetTop - 20,
          behavior: "smooth",
        });
      }, 300);
    }
  }
});

// Metadane strony
useHead({
  title: "Regulamin - NuxtShop",
  meta: [
    {
      name: "description",
      content:
        "Regulamin sklepu internetowego NuxtShop. Zasady korzystania, zamówienia, płatności, dostawy, reklamacje i zwroty.",
    },
  ],
});
</script>

<style scoped>
/* Stylowanie aktywnego linku w spisie treści - można dodać z wykorzystaniem JavaScript */
.toc-nav a.active {
  font-weight: bold;
  color: #047857; /* dark green */
}

/* Dodanie linii po lewej stronie sekcji dla lepszego oddzielenia */
section {
  border-left: 3px solid #f3f4f6;
  padding-left: 1rem;
}

section:hover {
  border-left-color: #10b981; /* green-500 */
}

/* Upewniamy się, że scroll-margin działa poprawnie w Safari */
section {
  scroll-margin-top: 2rem;
}

/* Dodanie efektu hover na linki w spisie treści */
.toc-nav a:hover {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
}
</style>
