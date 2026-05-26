import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "hsl(15,12%,5%)" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(244,81,30,0.08) 0%, transparent 60%)" }} />

      <div className="max-w-3xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/70 transition mb-8"
        >
          <Icon name="ArrowLeft" size={14} />
          Назад
        </button>

        <div className="rounded-3xl p-8 md:p-12"
          style={{ background: "rgba(12,6,2,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,81,30,0.15)" }}>

          <h1 className="text-3xl font-bold text-foreground mb-2">Пользовательское соглашение</h1>
          <p className="text-sm text-muted-foreground mb-8">Последнее обновление: 26 мая 2025 г.</p>

          <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Предмет соглашения</h2>
              <p>Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между администрацией сервиса «Формус» (далее — «Администрация») и физическим лицом (далее — «Пользователь»), использующим сервис по адресу <strong className="text-foreground">forms-dubble.ru</strong> (далее — «Сервис»).</p>
              <p className="mt-2">Используя Сервис, Пользователь подтверждает, что ознакомился с настоящим Соглашением и принимает его условия в полном объёме.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Описание сервиса</h2>
              <p>Формус — это веб-сервис для создания онлайн-форм, опросов и анкет, сбора и анализа ответов. Сервис предоставляется на условиях «как есть» (as is).</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Регистрация и доступ</h2>
              <p>Доступ к Сервису осуществляется через авторизацию с помощью сторонних сервисов (Яндекс ID, Даббл ID). Пользователь несёт ответственность за сохранность своих учётных данных.</p>
              <p className="mt-2">Пользователь гарантирует, что является совершеннолетним лицом (достигшим 18 лет). Если Пользователь не достиг указанного возраста, использование Сервиса допускается только с согласия родителей или законных представителей.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Права и обязанности пользователя</h2>
              <p className="mb-2">Пользователь вправе:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
                <li>Создавать формы и публиковать их для сбора ответов</li>
                <li>Просматривать и экспортировать полученные ответы</li>
                <li>Изменять и удалять свои формы и данные</li>
              </ul>
              <p className="mb-2">Пользователь обязуется:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Не использовать Сервис для сбора данных без согласия респондентов</li>
                <li>Не распространять через Сервис незаконный, вредоносный или оскорбительный контент</li>
                <li>Не использовать Сервис для рассылки спама</li>
                <li>Соблюдать требования ФЗ-152 «О персональных данных» при сборе данных через формы</li>
                <li>Не нарушать права третьих лиц, включая авторские и смежные права</li>
                <li>Не предпринимать попыток получить несанкционированный доступ к Сервису</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Ответственность пользователя за содержимое форм</h2>
              <p>Пользователь несёт полную ответственность за содержимое создаваемых форм и соблюдение законодательства РФ при сборе персональных данных респондентов, в том числе за наличие надлежащего согласия на обработку персональных данных.</p>
              <p className="mt-2">Администрация не несёт ответственности за действия Пользователей и содержание их форм.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibent text-foreground mb-3">6. Права Администрации</h2>
              <p className="mb-2">Администрация вправе:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Изменять функциональность Сервиса без предварительного уведомления</li>
                <li>Приостанавливать или прекращать доступ к Сервису при нарушении Соглашения</li>
                <li>Удалять формы и данные, нарушающие настоящее Соглашение или законодательство РФ</li>
                <li>Вносить изменения в настоящее Соглашение</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Ограничение ответственности</h2>
              <p>Сервис предоставляется «как есть». Администрация не гарантирует бесперебойную работу Сервиса и не несёт ответственности за:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Временную недоступность Сервиса</li>
                <li>Потерю данных по техническим причинам</li>
                <li>Убытки, возникшие в результате использования или невозможности использования Сервиса</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Интеллектуальная собственность</h2>
              <p>Все права на Сервис, его дизайн, программный код и товарные знаки принадлежат Администрации. Пользователь сохраняет все права на содержимое форм, созданных им в Сервисе.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Применимое право и разрешение споров</h2>
              <p>Настоящее Соглашение регулируется законодательством Российской Федерации. Все споры разрешаются в претензионном порядке, а при недостижении согласия — в судебном порядке по месту нахождения Администрации.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Изменение соглашения</h2>
              <p>Администрация вправе в одностороннем порядке изменять условия настоящего Соглашения. Новая редакция вступает в силу с момента публикации на сайте. Продолжение использования Сервиса означает принятие изменений.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">11. Контактная информация</h2>
              <p>По всем вопросам, связанным с настоящим Соглашением, обращайтесь: <strong className="text-foreground">support@forms-dubble.ru</strong></p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
