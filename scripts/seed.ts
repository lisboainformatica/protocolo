
import mongoose from 'mongoose';
import connectToDatabase from '../lib/db';
import { User, UserRole } from '../models/User';
import { Sector } from '../models/Sector';
import { Workflow } from '../models/Workflow';
import { WorkflowStage } from '../models/WorkflowStage';
import bcrypt from 'bcryptjs';

async function seed() {
    await connectToDatabase();
    console.log('Connected to DB');

    // 1. Create Sectors
    const sectorsData = [
        { name: 'TI', description: 'Tecnologia da Informação' },
        { name: 'RH', description: 'Recursos Humanos' },
        { name: 'Protocolo', description: 'Setor de Protocolo Geral' },
        { name: 'Jurídico', description: 'Departamento Jurídico' },
        { name: 'Diretoria', description: 'Diretoria Executiva' },
    ];

    const sectors = [];
    for (const s of sectorsData) {
        let sector = await Sector.findOne({ name: s.name });
        if (!sector) {
            sector = await Sector.create(s);
            console.log(`Created sector: ${s.name}`);
        }
        sectors.push(sector);
    }

    // 2. Create Users
    const passwordHash = await bcrypt.hash('admin123', 10);

    const adminData = {
        name: 'Administrador',
        email: 'admin@empresa.com',
        password: passwordHash,
        roles: [UserRole.ADMINISTRADOR],
        isActive: true,
    };

    let admin = await User.findOne({ email: adminData.email });
    if (!admin) {
        admin = await User.create(adminData);
        console.log('Created admin user');
    } else {
        // Update password if exists to ensure we can login
        admin.password = passwordHash;
        admin.roles = [UserRole.ADMINISTRADOR];
        await admin.save();
        console.log('Updated admin user');
    }

    // 3. Create Default Workflow (Example)
    const wfData = {
        name: 'Tramitação Padrão',
        description: 'Fluxo padrão de documentos',
        isActive: true,
    };

    let wf = await Workflow.findOne({ name: wfData.name });
    if (!wf) {
        wf = await Workflow.create(wfData);
        console.log('Created default workflow');
    }

    // 4. Create Stages for Workflow
    // Reception -> TI -> Jurídico -> Diretoria -> Conclusão
    const stagesData = [
        { name: 'Recepção', order: 1, sectorName: 'Protocolo', sla: 24 },
        { name: 'Análise Técnica', order: 2, sectorName: 'TI', sla: 48 },
        { name: 'Parecer Jurídico', order: 3, sectorName: 'Jurídico', sla: 72 },
        { name: 'Aprovação Final', order: 4, sectorName: 'Diretoria', sla: 24 },
    ];

    for (const s of stagesData) {
        const sector = sectors.find(sec => sec.name === s.sectorName);
        if (sector) {
            const stageExists = await WorkflowStage.findOne({ workflowId: wf._id, order: s.order });
            if (!stageExists) {
                await WorkflowStage.create({
                    workflowId: wf._id,
                    name: s.name,
                    order: s.order,
                    responsibleSectorId: sector._id,
                    slaHours: s.sla,
                    isMandatory: true,
                });
                console.log(`Created stage: ${s.name}`);
            }
        }
    }

    console.log('Seed completed');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
