<template>
  <div class="bg-gray-100 py-20 px-8">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 items-center justify-center">
        <div
          class="flex text-center md:text-left tracking-wide text-sm leading-6"
        >
          Skontaktuj się z nami telefonicznie pod numerem +48 450 066 077 lub za
          pośrednictwem poczty elektronicznej pisząc na adres
          kontakt@wermoss.com
        </div>
        <div class="flex flex-col justify-center items-center">
          <div class="text-black text-4xl font-bold leading-none mb-4">
            wermoss
          </div>
          <div class="col-span-6 flex items-end justify-center gap-2">
            <div class="px-2 cursor-pointer group">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/icons/facebook_dark.svg"
                  alt="Facebook"
                  class="h-4 w-auto transform transition-all duration-300 group-hover:-translate-y-2"
                />
              </a>
            </div>

            <div class="px-2 cursor-pointer group">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/icons/instagram_dark.svg"
                  alt="Instagram"
                  class="h-4 w-auto transform transition-all duration-300 group-hover:-translate-y-2"
                />
              </a>
            </div>

            <div class="px-2 cursor-pointer group">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/icons/linkedin_dark.svg"
                  alt="LinkedIn"
                  class="h-4 w-auto transform transition-all duration-300 group-hover:-translate-y-2"
                />
              </a>
            </div>
          </div>
        </div>
        <div>
          <ul
            class="flex flex-col md:flex-row justify-center items-center space-x-4 uppercase tracking-[0.2em] text-xs"
          >
            <li>Sklep</li>
            <li>O nas</li>
            <li>Kontakt</li>
            <li>Regulamin</li>
            <li>Polityka cookies</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div class="container mx-auto py-6">
      <div
        class="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 text-sm tracking-widest"
        name="aaa"
      >
        <div class="text-center md:text-left flex flex-row">
          <p>Płatności realizowane przez</p>
          <img
            src="/icons/stripe-wermoss.svg"
            alt="Stripe"
            class="h-5 ml-2 opacity-70"
          />
        </div>
        <div class="text-center md:text-right">
          <NuxtLink
            to="/regulamin"
            class="text-gray-600 hover:text-green-600 transition"
          >
            Regulamin sklepu
          </NuxtLink>
        </div>
      </div>

      <div
        class="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 text-sm tracking-widest mt-4"
      >
        <div class="flex flex-col md:flex-row items-center">
          <p class="mb-2 md:mb-0 md:mr-2">Dostępne formy płatności:</p>
          <div class="flex flex-row">
            <img
              src="/icons/stripe-wermoss.svg"
              alt="Stripe"
              class="h-5 ml-2 opacity-70"
            />
            <img
              src="/icons/stripe-wermoss.svg"
              alt="Visa"
              class="h-5 ml-2 opacity-70"
            />
            <img
              src="/icons/stripe-wermoss.svg"
              alt="Mastercard"
              class="h-5 ml-2 opacity-70"
            />
            <img
              src="/icons/stripe-wermoss.svg"
              alt="American Express"
              class="h-5 ml-2 opacity-70"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
