<template>
  <section class="my-20">
    <div class="container mx-auto max-w-6xl gap-8 px-8">
      <!-- Formularz kontaktowy -->
      <div>
        <div class="text-center mb-20">
          <h2 class="text-3xl font-semibold mb-6">Skontaktuj się z nami</h2>
          <p class="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab,
            obcaecati perferendis unde deleniti fugit earum optio delectus odio
            nemo placeat nostrum aut aspernatur dolore? Minima modi nihil non
            quis! Accusantium.
          </p>
        </div>

        <!-- Komunikat błędu -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          <p class="font-medium">Wystąpił błąd podczas wysyłania wiadomości</p>
          <p>{{ error }}</p>
        </div>

        <VeeForm
          @submit="submitForm"
          :validation-schema="schema"
          v-slot="{ errors, meta, resetForm }"
          ref="formRef"
        >
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Imię -->
              <div>
                <label
                  for="firstName"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Imię</label
                >
                <div class="input-container">
                  <VeeField
                    name="firstName"
                    type="text"
                    v-model="form.firstName"
                    class="form-input-underline"
                  />
                  <div class="input-animation-bar"></div>
                </div>
                <div class="h-5">
                  <VeeErrorMessage
                    name="firstName"
                    class="text-sm text-red-500"
                  />
                </div>
              </div>

              <!-- Nazwisko -->
              <div>
                <label
                  for="lastName"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Nazwisko</label
                >
                <div class="input-container">
                  <VeeField
                    name="lastName"
                    type="text"
                    v-model="form.lastName"
                    class="form-input-underline"
                  />
                  <div class="input-animation-bar"></div>
                </div>
                <div class="h-5">
                  <VeeErrorMessage
                    name="lastName"
                    class="text-sm text-red-500"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Email</label
                >
                <div class="input-container">
                  <VeeField
                    name="email"
                    type="email"
                    v-model="form.email"
                    class="form-input-underline"
                  />
                  <div class="input-animation-bar"></div>
                </div>
                <div class="h-5">
                  <VeeErrorMessage name="email" class="text-sm text-red-500" />
                </div>
              </div>

              <!-- Telefon -->
              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Telefon</label
                >
                <div class="input-container">
                  <VeeField
                    name="phone"
                    type="tel"
                    v-model="form.phone"
                    class="form-input-underline"
                  />
                  <div class="input-animation-bar"></div>
                </div>
                <div class="h-5">
                  <VeeErrorMessage name="phone" class="text-sm text-red-500" />
                </div>
              </div>
            </div>

            <!-- Temat wiadomości -->
            <div>
              <label
                for="subject"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Temat wiadomości</label
              >
              <div class="input-container">
                <VeeField
                  name="subject"
                  type="text"
                  v-model="form.subject"
                  class="form-input-underline"
                />
                <div class="input-animation-bar"></div>
              </div>
              <div class="h-5">
                <VeeErrorMessage name="subject" class="text-sm text-red-500" />
              </div>
            </div>

            <!-- Wiadomość -->
            <div>
              <label
                for="message"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Wiadomość</label
              >
              <div class="input-container">
                <VeeField
                  name="message"
                  as="textarea"
                  v-model="form.message"
                  rows="6"
                  class="form-input-underline"
                />
                <div class="input-animation-bar"></div>
              </div>
              <div class="h-5">
                <VeeErrorMessage name="message" class="text-sm text-red-500" />
              </div>
            </div>

            <!-- Zgoda na przetwarzanie danych -->
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <VeeField
                  name="consent"
                  type="checkbox"
                  :value="true"
                  :unchecked-value="false"
                  v-model="form.consent"
                  class="focus:ring-black h-4 w-4 text-black border-gray-300 rounded"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="consent" class="font-medium text-gray-700">
                  Wyrażam zgodę na przetwarzanie moich danych osobowych w celu
                  obsługi mojego zapytania *
                </label>
                <div class="h-5">
                  <VeeErrorMessage
                    name="consent"
                    class="block text-sm text-red-500"
                  />
                </div>
              </div>
            </div>

            <!-- Przycisk wysyłania oraz komunikat sukcesu -->
            <div>
              <button
                type="submit"
                :disabled="isSubmitting || !meta.valid"
                class="bg-black text-white px-6 py-3 rounded-md font-medium transition duration-200 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość" }}
              </button>

              <!-- Komunikat sukcesu -->
              <div
                v-if="messageSent"
                class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
              >
                <p class="font-medium">Dziękujemy za wiadomość!</p>
                <p>
                  Potwierdzenie zostało wysłane na podany adres email. Odpowiemy
                  najszybciej jak to możliwe.
                </p>
              </div>
            </div>
          </div>
        </VeeForm>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { nextTick } from "vue";

const schema = toTypedSchema(
  z.object({
    firstName: z
      .string()
      .min(2, "Imię musi zawierać co najmniej 2 znaki")
      .max(30, "Imię nie może przekraczać 30 znaków"),
    lastName: z
      .string()
      .min(2, "Nazwisko musi zawierać co najmniej 2 znaki")
      .max(30, "Nazwisko nie może przekraczać 30 znaków"),
    email: z.string().email("Nieprawidłowy format adresu email"),
    phone: z
      .string()
      .regex(/^\+?[\d\s-]{9,}$/, "Nieprawidłowy format numeru telefonu")
      .optional()
      .or(z.literal("")),
    subject: z
      .string()
      .min(5, "Temat musi zawierać co najmniej 5 znaków")
      .max(100, "Temat nie może przekraczać 100 znaków"),
    message: z
      .string()
      .min(10, "Wiadomość musi zawierać co najmniej 10 znaków")
      .max(2000, "Wiadomość nie może przekraczać 2000 znaków"),
    consent: z.boolean().refine((val) => val === true, {
      message: "Wymagana jest zgoda na przetwarzanie danych",
    }),
  })
);

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
});

const formRef = ref(null);
const isSubmitting = ref(false);
const messageSent = ref(false);
const error = ref("");

async function submitForm() {
  isSubmitting.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/mail/contact-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || "Nie podano",
        subject: form.subject,
        message: form.message,
      }),
    });

    const result = await response.json();

    if (result.success) {
      messageSent.value = true;

      // Po wysłaniu formularza nie resetujemy go od razu, aby uniknąć błędów walidacji
      // Tylko wyświetlamy komunikat o sukcesie

      // After 5 seconds, hide the success message
      setTimeout(() => {
        messageSent.value = false;
      }, 5000);

      // Resetujemy wartości formularza, ale nie od razu - pozwalamy najpierw użytkownikowi zobaczyć potwierdzenie
      nextTick(() => {
        // Resetujemy formularz bez wywoływania walidacji
        if (formRef.value) {
          // Najpierw resetujemy wartości modelu
          Object.keys(form).forEach((key) => {
            form[key as keyof typeof form] = key === "consent" ? false : "";
          });

          // Następnie resetujemy stan formularza w VeeValidate (aby usunąć błędy)
          formRef.value.resetForm({
            values: {
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              subject: "",
              message: "",
              consent: false,
            },
          });
        }
      });
    } else {
      error.value =
        result.error || "Wystąpił nieznany błąd podczas wysyłania wiadomości";
    }
  } catch (e) {
    console.error("Error submitting form:", e);
    error.value = "Nie udało się wysłać wiadomości. Spróbuj ponownie później.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Style dla pól formularza z animowanym dolnym borderem */
.input-container {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.form-input-underline {
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  border-bottom: 1px solid #d1d5db;
  background-color: transparent;
  outline: none;
  transition: border-color 0.3s;
}

.form-input-underline:focus {
  outline: none;
  box-shadow: none;
  /* Usuwamy zmianę koloru obramowania podczas fokusu, aby uniknąć podwójnej linii */
  border-bottom-color: transparent;
}

.input-animation-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: black;
  transition: width 0.3s ease-in-out;
  transform-origin: left;
  z-index: 2; /* Zwiększamy z-index, aby animowany pasek był zawsze na wierzchu */
}

.form-input-underline:focus + .input-animation-bar {
  width: 100%;
}

.form-input-underline:not(:focus) + .input-animation-bar {
  transform-origin: right;
  transition: width 0.3s ease-in-out;
  width: 0;
}

/* Usunięto style dla błędów, zostawiamy tylko komunikaty */

/* Styl dla textarea */
textarea.form-input-underline {
  resize: none;
  min-height: 100px;
  border: none;
  border-bottom: 1px solid #d1d5db;
  box-shadow: none;
}

textarea.form-input-underline:focus {
  border-bottom-color: transparent;
}
</style>
