// Sistema de diseño (Lora + Inter, verde institucional) embebido como componente.
// Se monta una sola vez en App.jsx, junto con el CSS de Bootstrap 5.
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@500;600;700&display=swap');
:root{--c-primary:#2c5f4a;--c-primary-dark:#1e4534;--c-primary-soft:#e4efe9;--c-accent:#b08948;--c-bg:#f1f0ea;--c-border:#e1e3dc;--c-text:#1a211d;--c-muted:#66716b;--c-success:#1e7f4d;--c-warning:#b7791f;--c-danger:#b4322b;--c-info:#3b6fa8;--c-public:#5b4b8a;
--bs-primary:#2c5f4a;--bs-primary-rgb:44,95,74;--bs-body-bg:var(--c-bg);--bs-body-color:var(--c-text);--bs-body-font-family:'Inter',system-ui,sans-serif;--bs-border-color:var(--c-border);--bs-link-color:var(--c-primary-dark);--bs-link-hover-color:var(--c-primary);--bs-link-color-rgb:30,69,52;--bs-link-hover-color-rgb:44,95,74;}
body{background:var(--c-bg);line-height:1.5} p {overflow-wrap: anywhere;word-break: break-word;}
h1,h2,h3,h4,.serif{font-family:'Lora',Georgia,serif;color:var(--c-primary-dark);font-weight:600}
h1,.h-screen{font-size:1.875rem;line-height:2.25rem}
h2,.h-section{font-size:1.375rem;line-height:1.875rem}
h3,.h-sub{font-size:1.0625rem;line-height:1.5rem;font-family:'Inter',sans-serif;font-weight:600;color:var(--c-text)}
.aux{font-size:.8125rem;line-height:1.125rem;color:var(--c-muted)}
.eyebrow{font-size:.75rem;line-height:1rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600;color:var(--c-muted)}
.eyebrow.accent{color:var(--c-accent)}
a{text-decoration:none}a:hover{text-decoration:underline}
.text-muted2{color:var(--c-muted)!important}.text-danger2{color:var(--c-danger)!important}.text-ok{color:var(--c-success)!important}.text-warn2{color:#8a5a12!important}
.btn{font-weight:600;font-size:.9375rem}
.btn-primary{--bs-btn-bg:var(--c-primary);--bs-btn-border-color:var(--c-primary);--bs-btn-hover-bg:var(--c-primary-dark);--bs-btn-hover-border-color:var(--c-primary-dark);--bs-btn-active-bg:var(--c-primary-dark);--bs-btn-active-border-color:var(--c-primary-dark)}
.btn-primary:disabled{background:#9db0a8;border-color:#9db0a8}
.btn-outline-primary{--bs-btn-color:var(--c-primary-dark);--bs-btn-border-color:var(--c-primary);--bs-btn-hover-bg:var(--c-primary);--bs-btn-hover-border-color:var(--c-primary);--bs-btn-active-bg:var(--c-primary)}
.btn-link{color:var(--c-primary-dark);text-decoration:none}
.btn-danger{--bs-btn-bg:var(--c-danger);--bs-btn-border-color:var(--c-danger);--bs-btn-hover-bg:#8f2620;--bs-btn-hover-border-color:#8f2620}
.btn-outline-danger{--bs-btn-color:var(--c-danger);--bs-btn-border-color:var(--c-danger);--bs-btn-hover-bg:var(--c-danger)}
.btn-outline-primary:disabled,.btn-outline-primary.disabled,.btn-outline-danger:disabled,.btn-outline-danger.disabled,.btn-outline-secondary:disabled{--bs-btn-disabled-color:#8d968f;--bs-btn-disabled-border-color:#d5d8d1;--bs-btn-disabled-bg:#fafaf6;opacity:1}
.btn-warn{background:var(--c-warning);border-color:var(--c-warning);color:#fff}.btn-warn:hover{background:#96620f;color:#fff}
.btn-outline-accent{background:#fff;border:1px solid var(--c-accent);color:#8a6a2b}.btn-outline-accent:hover{background:#f6ebd6;color:#6e5320}
.form-label{font-size:.75rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600;color:var(--c-muted);margin-bottom:.35rem}
.form-control,.form-select{border-color:var(--c-border);padding:.6rem .75rem;background-color:#fff}
.form-control:focus,.form-select:focus{border-color:var(--c-primary);box-shadow:0 0 0 .2rem rgba(44,95,74,.15)}
.form-control:disabled,.form-control[readonly],.form-select:disabled{background-color:#f9f9f5;color:var(--c-muted)}
.form-check-input:checked{background-color:var(--c-primary);border-color:var(--c-primary)}
.field-error{color:var(--c-danger);font-size:.8125rem;display:block;margin-top:.25rem}
.hint{font-size:.8125rem;color:var(--c-muted);margin-top:.25rem}
.app-header{background:#fff;border-bottom:1px solid var(--c-border);min-height:72px}
.brand-mark{width:36px;height:36px;border-radius:8px;background:var(--c-primary);color:#fff;display:grid;place-items:center;font-family:'Lora',serif;font-weight:700;font-size:.95rem}
.app-nav{background:var(--c-primary-dark);min-height:56px}
.app-nav a,.app-nav .nav-link-x{color:rgba(255,255,255,.88);font-weight:500;font-size:.9375rem;padding:1.05rem 0;margin-right:1.6rem;border-bottom:2px solid transparent;display:inline-flex;align-items:center;gap:.4rem;white-space:nowrap}
.app-nav a:hover{color:#fff;text-decoration:none}
.app-nav .nav-off{color:rgba(255,255,255,.42);font-weight:500;font-size:.9375rem;padding:1.05rem 0;margin-right:1.6rem;border-bottom:2px solid transparent;display:inline-flex;align-items:center;white-space:nowrap;cursor:not-allowed}
.app-nav a.active{color:#fff;font-weight:600;border-bottom-color:var(--c-accent)}
.nav-right{color:rgba(255,255,255,.9);font-size:.8125rem}
.nav-right button{color:#fff;font-weight:600;font-size:.8125rem;background:none;border:0;padding:0}
.nav-count{background:var(--c-accent);color:#fff;border-radius:999px;font-size:.6875rem;padding:0 .4rem;line-height:1.1rem}
.page{max-width:1760px;margin:0 auto;padding:2.25rem 1.5rem 3rem}
@media(min-width:1200px){.page{padding:2.5rem 3rem 3rem}}
.app-footer{background:#fff;border-top:1px solid var(--c-border);min-height:84px;font-size:.8125rem;color:var(--c-muted)}
.crumbs{font-size:.8125rem;color:var(--c-muted);margin-bottom:.25rem}.crumbs a{color:var(--c-muted)}
.card-tfc{background:#fff;border:1px solid var(--c-border);border-radius:8px;box-shadow:0 1px 2px rgba(26,33,29,.04)}
.card-tfc.pad{padding:1.5rem}
.card-tfc.soft{background:var(--c-primary-soft);border-color:var(--c-primary)}
.card-tfc.warn{background:#fdf1dc;border-color:var(--c-warning)}
.card-tfc.danger{background:#fbe9e7;border-color:var(--c-danger)}
.card-tfc.flat{background:#fafaf6;box-shadow:none}
.card-tfc.dashed{border:1px dashed var(--c-primary)}
.card-tfc.dim{background:#fafaf6;color:var(--c-muted)}
.card-head{padding:1rem 1.5rem;border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between}
.card-foot{padding:.9rem 1.5rem;border-top:1px solid var(--c-border);background:#fafaf6;font-size:.8125rem;color:var(--c-muted);border-radius:0 0 8px 8px}
.rowline{border-bottom:1px solid var(--c-border);padding:.75rem 0}.rowline:last-child{border-bottom:0}
.table-tfc{margin:0}
.table-tfc th{background:#fafaf6;font-size:.75rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted);font-weight:600;border-bottom:1px solid var(--c-border);padding:.8rem 1rem;white-space:nowrap}
.table-tfc td{padding:.8rem 1rem;vertical-align:middle;border-color:var(--c-border)}
.table-tfc tr.row-muted td{color:var(--c-muted);background:#fafaf6}
.tag{display:inline-block;font-size:.75rem;font-weight:600;padding:.15rem .55rem;border-radius:5px;white-space:nowrap}
.st-muted{background:#ecece6;color:var(--c-muted)}.st-propuesta{background:#ecece6;color:#55605a}
.st-info{background:#e6eef7;color:var(--c-info)}.st-ok{background:var(--c-primary-soft);color:var(--c-success)}
.st-warn{background:#fdf1dc;color:#8a5a12}.st-accent{background:#f6ebd6;color:#8a6a2b}.st-danger{background:#fbe9e7;color:var(--c-danger)}
.line-tag{display:inline-block;background:var(--c-primary-soft);color:var(--c-primary-dark);font-size:.75rem;font-weight:500;padding:.15rem .55rem;border-radius:5px;margin:0 .3rem .3rem 0}
.role-pill{font-size:.75rem;font-weight:600;padding:.2rem .6rem;border-radius:5px;border:1px solid;display:inline-block}
.role-pill.publico{background:#efeaf8;color:var(--c-public);border-color:var(--c-public)}
.role-pill.estudiante{background:var(--c-primary-soft);color:var(--c-primary-dark);border-color:var(--c-primary)}
.role-pill.asesor{background:#fdf1dc;color:#8a5a12;border-color:var(--c-warning)}
.role-pill.admin{background:var(--c-primary-dark);color:#fff;border-color:var(--c-primary-dark)}
.chip{background:var(--c-primary-soft);border-radius:8px;padding:.4rem .8rem;font-size:.8125rem;display:inline-flex;align-items:center;gap:.6rem}
.chip.gray{background:#ecece6;color:var(--c-muted)}
.chip .mini-bar{width:52px;height:6px;background:#fff;border-radius:4px;overflow:hidden}.chip .mini-bar span{display:block;height:100%;background:var(--c-primary)}
.avatar{border-radius:50%;background:var(--c-primary-soft);color:var(--c-primary-dark);display:inline-grid;place-items:center;font-weight:700;flex:none}
.avatar.dark{background:var(--c-primary);color:#fff}
.progress-tfc{height:8px;background:var(--c-border);border-radius:6px;overflow:hidden}
.progress-tfc>span{display:block;height:100%;background:var(--c-primary);border-radius:6px;transition:width .3s}
.progress-tfc.ok>span{background:var(--c-success)}.progress-tfc.warn>span{background:var(--c-warning)}.progress-tfc.accent>span{background:var(--c-accent)}.progress-tfc.danger>span{background:var(--c-danger)}
.pct{font-weight:600;font-size:1.5rem;color:var(--c-primary-dark)}
.timeline{position:relative;padding-left:2rem}
.timeline::before{content:'';position:absolute;left:9px;top:12px;bottom:12px;width:1px;background:var(--c-border)}
.tl-item{position:relative;padding-bottom:1.25rem}
.tl-dot{position:absolute;left:-2rem;top:5px;width:16px;height:16px;border-radius:50%;background:var(--c-muted);border:0;box-shadow:0 0 0 3px #fff}
.tl-dot.aprobado{background:var(--c-success)}.tl-dot.entregado{background:var(--c-info)}.tl-dot.retraso{background:var(--c-warning)}.tl-dot.observado{background:var(--c-accent)}.tl-dot.vencido{background:var(--c-danger)}
.tl-dot.pendiente{background:#fff;border:2px dashed var(--c-muted)}
.tl-box.vencido{background:#fbe9e7;border:1px solid var(--c-danger);padding:.9rem 1rem;border-radius:8px}
.tl-title{font-size:1.125rem;font-weight:600}
.hero{background:var(--c-primary-soft);border:1px solid var(--c-primary);border-radius:8px;padding:2.5rem}
.hero h1{font-size:2.25rem;line-height:2.75rem}
.quote{border-left:3px solid var(--c-border);background:#fafaf6;padding:.8rem 1rem;border-radius:0 6px 6px 0}
.quote.green{border-left-color:var(--c-primary)}.quote.accent{border-left-color:var(--c-accent)}
.dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:.6rem;vertical-align:middle}
.dot.done{background:var(--c-primary)}.dot.now{background:var(--c-accent)}.dot.todo{border:1.5px dashed var(--c-muted)}
.stage{border-left:3px solid var(--c-border);padding-left:.8rem;margin-bottom:1rem}
.stage.done{border-left-color:var(--c-primary)}.stage.now{border-left-color:var(--c-accent)}
.empty{text-align:center;padding:2.5rem 1.5rem}
.empty .icon{width:48px;height:48px;border-radius:50%;background:#ecece6;display:inline-grid;place-items:center;font-size:1.2rem;margin-bottom:.75rem;color:var(--c-muted)}
.empty.ok .icon{background:var(--c-primary-soft);color:var(--c-success)}.empty.warn .icon{background:#fdf1dc;color:var(--c-warning)}.empty.danger .icon{background:#fbe9e7;color:var(--c-danger)}
.side-nav button{width:100%;text-align:left;background:#fff;border:0;border-bottom:1px solid var(--c-border);padding:.8rem 1rem;font-weight:500;color:var(--c-muted)}
.side-nav button.active{background:var(--c-primary-soft);color:var(--c-primary-dark);font-weight:600;border-left:3px solid var(--c-primary)}
.tags-input{border:1px solid var(--c-border);border-radius:6px;padding:.4rem .5rem;display:flex;flex-wrap:wrap;gap:.4rem;background:#fff}
.tags-input.invalid{border-color:var(--c-danger)}
.tags-input input{border:0;outline:0;flex:1;min-width:160px;padding:.25rem}
.tags-input .line-tag{margin:0}.tags-input .line-tag button{background:none;border:0;padding:0 0 0 .3rem;color:var(--c-primary-dark)}
.modal-backdrop-tfc{position:fixed;inset:0;background:rgba(26,33,29,.45);z-index:1050}
.modal.d-block{z-index:1055;overflow-y:auto}
.modal-content{border:1px solid var(--c-border);border-radius:8px}
.toast-stack{position:fixed;top:1rem;right:1rem;z-index:2000;width:380px;max-width:calc(100vw - 2rem);display:grid;gap:.6rem}
.toast-tfc{border:1px solid;border-radius:8px;padding:.7rem 1rem;display:flex;gap:.7rem;align-items:flex-start;box-shadow:0 4px 14px rgba(0,0,0,.1)}
.toast-tfc.success{background:var(--c-primary-soft);border-color:var(--c-primary);color:var(--c-primary-dark)}
.toast-tfc.warning{background:#fdf1dc;border-color:var(--c-warning);color:#8a5a12}
.toast-tfc.danger{background:#fbe9e7;border-color:var(--c-danger);color:var(--c-danger)}
.toast-tfc.info{background:#e6eef7;border-color:var(--c-info);color:var(--c-info)}
.stat-big{font-family:'Lora',serif;font-size:2.25rem;font-weight:600;color:var(--c-primary-dark);line-height:1.1}
.slot{border:1px solid var(--c-border);border-radius:6px;padding:.6rem .8rem;display:flex;justify-content:space-between;background:#fff;margin-bottom:.5rem}
.slot.busy{background:#fafaf6}.slot.sel{background:var(--c-primary-soft);border-color:var(--c-primary);font-weight:600}
.print-sheet{background:#fff;border:1px solid #999;max-width:820px;margin:0 auto;padding:2.5rem}
.sig{border-top:1px solid #1a211d;padding-top:.3rem;font-size:.75rem}
@media print{.app-header,.app-nav,.app-footer,.no-print,.modal-backdrop-tfc,.modal-header,.modal-footer,.toast-stack{display:none!important}body{background:#fff}.page{padding:0}.modal.d-block{position:static;overflow:visible}.modal-dialog{max-width:100%;margin:0}.modal-content{border:0}}
`;

export default function Theme() {
  return <style>{css}</style>;
}
