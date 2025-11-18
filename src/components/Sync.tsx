import React, { useRef } from 'react';
import { AppDataHook } from '../types';

const Card: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="glass-card p-4 rounded-lg">
        <h3 className="font-bold text-base">{title}</h3>
        <p className="text-sm text-muted mb-3">{description}</p>
        {children}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-accent' : 'bg-subtle'}`}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);


export const Sync: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const { isCloudOn, setIsCloudOn, apiBase, setApiBase, orgId, setOrgId, syncStatus, syncNow, importData, exportJson, exportCsv } = appData;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
        }
    };

    return (
        <div className="space-y-4">
             <div>
                <h1 className="text-2xl font-extrabold text-primary">Ajustes y Sincronización</h1>
                <p className="text-muted">Gestiona la configuración de la nube y tus datos.</p>
            </div>
            <div className="glass-card rounded-xl p-4 shadow-lg space-y-4">
                <Card title="Cloud Sync" description="Sincroniza tus datos con un servidor remoto.">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="cloud-toggle" className="font-medium">Activar Cloud Sync</label>
                            <ToggleSwitch checked={isCloudOn} onChange={setIsCloudOn} />
                        </div>
                        <div className={!isCloudOn ? 'opacity-50' : ''}>
                            <div>
                                <label className="text-sm text-muted">URL del API</label>
                                <input type="text" value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="https://..." disabled={!isCloudOn} className="w-full p-2 mt-1 bg-panel border border-border rounded-md text-sm disabled:cursor-not-allowed" />
                            </div>
                             <div>
                                <label className="text-sm text-muted">ID de Organización</label>
                                <input type="text" value={orgId} onChange={e => setOrgId(e.target.value)} placeholder="ID de la organización" disabled={!isCloudOn} className="w-full p-2 mt-1 bg-panel border border-border rounded-md text-sm disabled:cursor-not-allowed" />
                            </div>
                            <button onClick={syncNow} disabled={!isCloudOn || syncStatus !== 'idle'} className="w-full mt-2 text-sm bg-accent hover:bg-accent-2 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                {syncStatus === 'idle' ? 'Sincronizar Ahora' : `Sincronizando... (${syncStatus})`}
                            </button>
                        </div>
                    </div>
                </Card>

                <Card title="Copia de Seguridad" description="Guarda o carga tus datos desde un archivo.">
                    <div className="flex gap-2">
                        <button onClick={exportJson} className="flex-1 text-sm bg-subtle hover:bg-white/20 font-bold py-2 px-4 rounded-md">Exportar JSON</button>
                        <button onClick={exportCsv} className="flex-1 text-sm bg-subtle hover:bg-white/20 font-bold py-2 px-4 rounded-md">Exportar CSV</button>
                    </div>
                    <div className="mt-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={handleImportClick} className="w-full text-sm bg-subtle hover:bg-white/20 font-bold py-2 px-4 rounded-md">
                            Importar JSON
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
